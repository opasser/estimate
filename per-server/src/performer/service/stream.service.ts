import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StreamMod } from '../model/stream.model';
import { StreamDto } from '../dto/stream.dto';
import { PerformerMod } from '../model/performer.model';
import { literal, Op, QueryTypes } from 'sequelize';
import * as jwt from 'jsonwebtoken';
import {
  BehaviorSubject,
  catchError,
  finalize, firstValueFrom,
  forkJoin,
  map,
  retry,
  switchMap,
  timer,
} from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { fromFetch } from 'rxjs/internal/observable/dom/fetch';
import { IPrivateRoomPayload } from '../controller/stream.controller';
import { HttpService } from '@nestjs/axios';
import { IPaymentItem, PaymentService } from '../../payment/payment.service';
import { MemberMod } from '../../member/model/member.model';

export interface IAnalytics {
  streamId: string;
  status: 'broadcasting' | 'created';
  webRTCViewerCount: string;
  anyoneWatching: boolean;
  subTrackStreamIds: string[];
  startTime: number;
}

@Injectable()
export class StreamService {
  updatesStreamStatus: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    @InjectModel(StreamMod) private streamRepository: typeof StreamMod,
    @InjectModel(PerformerMod) private performerRepository: typeof PerformerMod,
    private configService: ConfigService,
    private httpService: HttpService,
    private paymentService: PaymentService,
  ) {}

  async createStream(dto: StreamDto) {
    if (dto.privacy === 'private') {
      this.updatesStreamStatus.next(false);

      setTimeout(() => this.updatesStreamStatus.next(true), 30000);
    }

    try {
      const existingStream = await this.streamRepository.findOne({
        where: { streamId: dto.streamId },
      });

      if (existingStream) {
        return {
          status: HttpStatus.CONFLICT,
          message: `Stream ${dto.streamId} already exists`,
        };
      }

      const activeStreams = await this.streamRepository.findAll({
        where: {
          performerId: dto.performerId,
          status: 'active',
          privacy: dto.privacy
        },
      });

      for (const stream of activeStreams) {
        stream.status = 'finished';
        stream.endTime = new Date();
        await stream.save();
      }

      await this.streamRepository.create({
        ...dto,
        status: 'active',
        startTime: new Date(),
      });

      return {
        status: HttpStatus.OK,
        message: 'Stream created successfully',
        streamData: dto
      };
    } catch (error) {
      console.error('createStream: Failed to create stream', error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create stream',
      };
    }
  }

  async setStreamFinished(streamId: string) {
    let streamType = "Stream";

    try {
      const stream = await this.streamRepository.findOne({
        where: { streamId: streamId },
      });

      if (!stream) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Stream not found',
        };
      }

      if (stream.status === 'finished') {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Stream is already finished',
        };
      }

      if(stream.privacy === 'private') {
        streamType = "Private stream";

        this.minutesMap.delete(stream.streamId);
      }

      stream.status = 'finished';
      stream.endTime = new Date();
      stream.currentViewers = 0;
      await stream.save();

      return {
        status: HttpStatus.OK,
        message: `${streamType} finished`,
      };
    } catch (error) {
      console.error(
        'setStreamFinished => Failed to update stream status:',
        error,
      );
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update stream status',
        error: error.message,
      };
    }
  }

  async getPerformerRoomData$(nickName: string) {
    const query = `
        SELECT p."nickName", p."id", p."avatarUrl", s."status", p."about", p."birthday", p."gender", p."bodyType", p."language", p."sexualOrientation",
               CASE
                   WHEN s."status" = 'finished' THEN NULL
                   ELSE s."privacy"
                   END AS "privacy",
               CASE
                   WHEN s."status" = 'finished' THEN NULL
                   WHEN s."privacy" = 'private' THEN NULL
                   ELSE s."streamId"
                   END AS "streamId",
               CASE
                   WHEN s."status" = 'finished' THEN NULL
                   WHEN s."privacy" = 'private' THEN NULL
                   ELSE s."privateWith"
                   END AS "privateWith"
        FROM performers p
                 LEFT JOIN
             (
                 SELECT DISTINCT ON ("performerId") "performerId", "status", "privacy", "streamId", "privateWith"
                 FROM streams
                 ORDER BY
                     "performerId",
                     CASE WHEN "status" = 'active' THEN 0 ELSE 1 END
             ) s ON s."performerId" = p.id
        WHERE p."isPublic" = true
          AND p."nickName" = :nickName
        ORDER BY
            CASE
                WHEN s."status" = 'active' THEN 0
                ELSE 1
                END
            LIMIT 1;
    `;

    const result = await this.performerRepository.sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { nickName },
    });

    return result[0] || null;
  }

  async getRooms$() {
    const query = `
        SELECT p."nickName", p."id", p."avatarUrl", s."status", s."endTime",
               CASE WHEN s."status" = 'finished' THEN NULL ELSE s."privacy" END AS "privacy",
               CASE
                 WHEN s."status" = 'finished' THEN NULL
                 WHEN s."privacy" = 'private' THEN NULL
                 ELSE s."streamId"
                 END AS "streamId"
        FROM performers p
                 LEFT JOIN
             (
                 SELECT DISTINCT ON ("performerId") "performerId", "endTime", "status", "privacy", "streamId"
                 FROM streams
                 ORDER BY
                     "performerId",
                     CASE WHEN "status" = 'active' THEN 0 ELSE 1 END,
                     "endTime" DESC
             ) s ON s."performerId" = p.id
        WHERE p."isPublic" = true
        ORDER BY
            CASE
                WHEN s."status" = 'active' THEN 0
                ELSE 1
                END,
            s."endTime" DESC NULLS LAST;
    `;

    return await this.performerRepository.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
  }

  async getAllOrSearch(
    subStr: string = '',
    page: number = 1,
    limit: number = 10,
  ) {
    const offset = (page - 1) * limit;

    let whereCondition: any;

    if (subStr) {
      whereCondition = {
        [Op.or]: [
          { streamId: { [Op.iLike]: `%${subStr}%` } },
          { '$performer.nickName$': { [Op.iLike]: `%${subStr}%` } },
        ],
      };
    }

    try {
      const { rows: entities, count: totalItems } =
        await this.streamRepository.findAndCountAll({
          where: whereCondition,
          attributes: [
            'id',
            [ literal(`"performer"."nickName"`), 'nickName' ],
            'streamId',
            'status',
            'startTime',
            'endTime',
            'currentViewers',
            'maxViewers',
            'privacy',
            'privateWith',
          ],
          limit,
          offset,
          order: [['id', 'DESC']],
          include: [
            {
              model: PerformerMod,
              attributes: [],
            },
          ],
          raw: true,
        });

      const totalPages = Math.ceil(totalItems / limit);
      const currentPage = page > totalPages ? 1 : page;

      return {
        entities,
        meta: {
          itemCount: totalItems,
          currentPage: currentPage,
          totalPages: totalPages,
        },
      };
    } catch (error) {
      console.error(`getAllOrSearch => Search: ${subStr} not found`, error);
      throw new HttpException(
        `Search: ${subStr} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getById(id: number) {
    return this.streamRepository.findOne({
      where: { id },
    });
  }

  async getByStreamId(streamId: string) {
    return this.streamRepository.findOne({
      where: { streamId },
    });
  }

  async delete(id: number) {
    const entity = await this.getById(id);

    if (!entity) {
      throw new HttpException(`Stream ID${id} not found`, HttpStatus.NOT_FOUND);
    }

    await entity.destroy();

    return {
      status: HttpStatus.OK,
      message: `Stream ID${id} deleted successfully`,
    };
  }

  async getStreamByPerformerId(performerId: number) {
    try {
      return await StreamMod.findOne({
        where: {
          performerId,
          status: 'active',
        },
        order: [['startTime', 'DESC']],
      });
    } catch (error) {
      console.error(
        'getStreamByPerformerId => Unable to fetch the active stream:',
        error,
      );
      throw new HttpException(
        'Unable to fetch the active stream.',
        HttpStatus.NOT_FOUND,
      );
    }
  }
  



  generateJwtToken(accessKey: string) {
    const expiresIn = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME'); // "1h" или "3600"
    const options = { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] };

    return jwt.sign({}, accessKey, options);
  }

  sendData(id: string, data: any) {
    const WEB_RTC_ACCESS_KEY = this.configService.get<string>('WEB_RTC_ACCESS_KEY');
    const jwtToken = this.generateJwtToken(WEB_RTC_ACCESS_KEY);
    const WEB_RTC_SERVER_URL = this.configService.get<string>('WEB_RTC_SERVER_URL');
    const url = `${WEB_RTC_SERVER_URL}/WebRTCAppEE/rest/v2/broadcasts/${id}/data`;

    const headers = { Accept: 'application/json', Authorization: jwtToken, 'Content-Type': 'application/json' };

    return fromFetch(url, { method: 'POST', headers,  body: JSON.stringify(data) }).pipe(
      retry({ count: 3, delay: () => timer(1000) }),
      switchMap((response) => response.json()),
      catchError((error) => {
        console.error('SendData => Response error:', error);
        throw error;
      }),
    );
  }

  getStreamAnalytics() {
    const WEB_RTC_ACCESS_KEY = this.configService.get<string>('WEB_RTC_ACCESS_KEY');
    const jwtToken = this.generateJwtToken(WEB_RTC_ACCESS_KEY);
    const WEB_RTC_SERVER_URL = this.configService.get<string>('WEB_RTC_SERVER_URL');
    const ACTIVE_STREAM_PATH = this.configService.get<string>('ACTIVE_STREAM_PATH');
    const url = `${WEB_RTC_SERVER_URL}${ACTIVE_STREAM_PATH}`;

    const headers = { Accept: 'application/json', Authorization: jwtToken };

    return this.httpService.get(url, { headers })
      .pipe(
        map((response) => response?.data || []),
        catchError((error) => {
          console.error('getStreamAnalytics => Response error:', error);
          throw error;
        }),
    );
  }

  minutesMap = new Map<string, number>();
  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateStream() {
    try {
      const analytics: IAnalytics[] = await firstValueFrom(this.getStreamAnalytics());
      const activeStreams: StreamMod[] = await this.getActiveStreams();
      const updatesStreamStatus = await firstValueFrom(this.updatesStreamStatus);

      if (!activeStreams.length || !updatesStreamStatus) {
        this.minutesMap.clear();

        return;
      }

      for (const activeStream of activeStreams) {
        const analyticsItem = analytics.find((analytic) =>
          analytic.streamId === activeStream.streamId
        );

        const subTrackStreamIds = analyticsItem?.subTrackStreamIds;

        if (subTrackStreamIds?.length >= 2) {
          const diff = Date.now() - analyticsItem.startTime;
          const minute = Math.floor(diff / 1000 / 60);

          console.log('tick', analyticsItem.streamId, minute)

          if (!this.minutesMap.has(analyticsItem.streamId)) {
            this.minutesMap.set(analyticsItem.streamId, minute);
          }

          if (minute > this.minutesMap.get(analyticsItem.streamId)) {
            this.minutesMap.set(analyticsItem.streamId, minute);

            const paymentItem: IPaymentItem = {
              type: 'c2c',
              streamId: activeStream.streamId,
              performerId: activeStream.performerId,
              amount: 0,
              memberId: activeStream.privateWith,
              custom: activeStream.streamId,
            };

            try {
             const userData = await this.paymentService.makePayment(paymentItem);

             await firstValueFrom(this.sendData(analyticsItem.streamId, { eventName: "updateBalance", userData }));

            } catch (error) {
              console.error('Private stream payment => Failed transaction:', error?.message || error);

              if (error.message === "Not enough balance" ) {
                await firstValueFrom(this.sendData(analyticsItem.streamId, {
                  eventName: "updateBalance",
                  userData: null
                }));
              }

              await this.closePrivateStream([analyticsItem.streamId, ...subTrackStreamIds], activeStream.id);
            }
          }
        }

        if (subTrackStreamIds?.length === 1) {
          await this.closePrivateStream([analyticsItem.streamId, ...subTrackStreamIds], activeStream.id);
        }

        if (!analyticsItem) {
          await this.updateStreamStatus(activeStream.id);
          // for some webrtc problem
          await firstValueFrom(this.deleteStream(activeStream.streamId));
        }
      }
    } catch (error) {
      console.error('Cron updateStream => ', error);
    }
  }

  async closePrivateStream(ids: string[], activeStreamId: number) {
    try {
      return firstValueFrom(
        forkJoin(ids.map(id => this.deleteStream(id)))
          .pipe(
            switchMap(() => this.updateStreamStatus(activeStreamId)),
            finalize(() => this.minutesMap.delete(ids[0])
          )
        )
      );
    } catch (error) {
      console.warn('Delete stream  => Failed ', error);
    }
  }

  deleteStream(streamId: string) {
    const WEB_RTC_ACCESS_KEY = this.configService.get<string>('WEB_RTC_ACCESS_KEY');
    const jwtToken = this.generateJwtToken(WEB_RTC_ACCESS_KEY);
    const WEB_RTC_SERVER_URL = this.configService.get<string>('WEB_RTC_SERVER_URL');
    const DELETE_STREAM = this.configService.get<string>('DELETE_STREAM');
    const url = `${WEB_RTC_SERVER_URL}${DELETE_STREAM}${streamId}`;

    const headers = { accept: 'application/json', Authorization: jwtToken };
    return this.httpService.delete(url, { headers })
      .pipe(map(res => res.data))
  }

  async updateViewers( streamId: string, viewers: number) {
    const stream = await this.getByStreamId(streamId);

    if (!stream) return;

    if (stream.currentViewers !== viewers) {
      stream.currentViewers = viewers;

      if (stream.maxViewers < viewers) {
        stream.maxViewers = viewers;
      }

      await stream.save();
    }
  }

  async updateStreamStatus(id: number) {
    console.log('updateStreamStatus => ', id);
    const stream = await this.getById(id);
    stream.status = 'finished';
    stream.endTime = new Date();
    stream.currentViewers = 0;
    await stream.save();
  }

  async getActiveStreams() {
    try {
      return await this.streamRepository.findAll({
        where: { status: 'active' },
        raw: true,
      });
    } catch (error) {
      console.error(
        'getActiveStreams => Failed to fetch active streams;',
        error,
      );
      throw new HttpException(
        'Failed to fetch active streams.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPrivateStreamData({ streamId, role, participantId }: IPrivateRoomPayload) {
    const stream = await this.streamRepository.findOne({
      where: { streamId },
      attributes: ['performerId', 'streamId', 'status', 'privacy', 'privateWith'],
      include: [
        {
          model: PerformerMod,
          attributes: ['name'],
        },
        {
          model: MemberMod,
          attributes: ['name'],
        },
      ]
    });

    if (!stream) {
      throw new NotFoundException('Unable to fetch the active stream.');
    }

    const isPerformer = role === 'performer' && stream.performerId === Number(participantId);
    const isMember = role === 'member' && stream.privateWith === Number(participantId);

    if (!isPerformer && !isMember) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    return stream;
  }

  async getRoomsByCategory$(categoryName: string) {
    const query = `
    SELECT p."nickName", p."id", p."avatarUrl", s."status", s."endTime",
           CASE WHEN s."status" = 'finished' THEN NULL ELSE s."privacy" END AS "privacy",
           CASE WHEN s."privacy" = 'private' THEN NULL ELSE s."streamId" END AS "streamId"
    FROM performers p
      INNER JOIN "category-performer" cp ON cp."performerId" = p."id"
      INNER JOIN categories c ON c."id" = cp."categoryId"
      LEFT JOIN (
        SELECT DISTINCT ON ("performerId") "performerId", "endTime", "status", "privacy", "streamId"
        FROM streams
        ORDER BY
          "performerId",
          CASE WHEN "status" = 'active' THEN 0 ELSE 1 END,
          "endTime" DESC
      ) s ON s."performerId" = p.id
    WHERE p."isPublic" = true AND c."name" = :categoryName
    ORDER BY
      CASE
        WHEN s."status" = 'active' THEN 0
        ELSE 1
      END,
      s."endTime" DESC NULLS LAST;
  `;

    return await this.performerRepository.sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { categoryName },
    });
  }
}
