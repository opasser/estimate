import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PaymentMod } from './model/payment.model';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import { CreatePayoutDto } from './dto/payout.dto';
import { PayoutMod } from './model/payout.mod';
import { HttpService } from '@nestjs/axios';
import { catchError, filter, firstValueFrom, map } from 'rxjs';
import { PerformerMod } from '../performer/model/performer.model';
import { MemberMod } from '../member/model/member.model';
import { ConfigService } from '@nestjs/config';
import { CryptService } from '../crypt/crypt.service';
import { MemberService } from '../member/service/member.service';
import { PerformerService } from '../performer/service/performer.service';

export interface IPaymentItem {
  type: 'tips' | 'c2c' | 'stream';
  streamId: string;
  performerId: number;
  amount: number;
  memberId: number;
  custom?: string;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(PaymentMod) private paymentRepository: typeof PaymentMod,
    @InjectModel(PayoutMod) private payoutRepository: typeof PayoutMod,
    private httpService: HttpService,
    private configService: ConfigService,
    private cryptService: CryptService,
    private memberService: MemberService,
    private performerService: PerformerService,
  ) {}

  async makePayment(paymentItem: IPaymentItem) {
    const { performerId, memberId } = paymentItem;
    const { paymentRate, c2cAmount }: PerformerMod = await this.performerService.getById(performerId);
    const { providerId } : MemberMod = await this.memberService.getById(memberId);

    if(paymentItem.type === 'c2c') { paymentItem.amount = c2cAmount }

    const data = await this.withdrawIfAvailable(paymentItem, providerId);

    if (data.success) {
      const { balance } = data.user;
      await this.memberService.changeTokenAmount(memberId, balance);
      await this.saveTransaction(paymentItem, paymentRate);
      return await this.cryptService.encryptCoins(balance);
    } else {
      return data;
    }
  }

  async checkMemberBalance(id: number) {
    const member: MemberMod = await this.memberService.getById(id);
    const data = await this.getMemberBalance(member.providerId);

    if (data?.status === null) {
      console.error(`getMemberBalance => Member request error`, data?.message);
      throw new HttpException(
        'Check balance error',
        HttpStatus.BAD_REQUEST,
      )
    }

    if(data?.user) {
      const balance = data?.user?.balance || 0;

      await this.memberService.changeTokenAmount(id, balance);
      const userData = await this.cryptService.encryptCoins(balance);

      return {
        status: HttpStatus.OK,
        message: `Balance data updated successfully`,
        userData
      };
    }
  }

  async getAllPaymentsOrSearch(
    subStr: string = '',
    page: number = 1,
    limit: number = 10,
  ) {
    const typeArr: string[] = ['tips', 'c2c','stream'];

    const offset = (page - 1) * limit;

    let whereCondition: any = {};

    if (subStr) {
      whereCondition = {
        [Op.or]: [
          typeArr.includes(subStr) && { type: subStr },
          !isNaN(Number(subStr)) && { performerId: { [Op.eq]: Number(subStr) } },
          !isNaN(Number(subStr)) && { memberId: { [Op.eq]: Number(subStr) } },
          { streamId: { [Op.iLike]: `%${subStr}%` } },
          { '$performer.name$': { [Op.iLike]: `%${subStr}%` } },
          { '$member.name$': { [Op.iLike]: `%${subStr}%` } },
        ],
      };
    }

    try {
      const { rows: entities, count: totalItems } =
        await this.paymentRepository.findAndCountAll({
          attributes: [
            'id',
            'streamId',
            'type',
            'performerId',
            [Sequelize.col('performer.name'), 'performerName'],
            'memberId',
            [Sequelize.col('member.name'), 'memberName'],
            'amount',
            'performerRate',
            [Sequelize.literal('"PaymentMod"."amount" * "PaymentMod"."performerRate" / 100'), 'sum'],
            'payoutId',
            'createdAt',
          ],
          include: [
            {
              model: PerformerMod,
              attributes: [],
              as: 'performer',
            },
            {
              model: MemberMod,
              attributes: [],
              as: 'member',
            },
          ],
          where: whereCondition,
          limit,
          offset,
          order: [['id', 'DESC']],
          raw: true
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
      console.error(`getAllPaymentsOrSearch => Search: ${subStr} not found`, error);
      throw new HttpException(
        'Payments Search error',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async saveTransaction(paymentItem: IPaymentItem, paymentRate: number) {
    const { type, streamId, performerId, memberId, amount } = paymentItem;
    try {
        await this.paymentRepository.create({
        type,
        streamId,
        performerId,
        memberId,
        amount,
        performerRate: paymentRate,
      });
    } catch (error) {
      console.error('saveTransaction => Error saving transaction:', error);
      throw new HttpException(
        'Error saving transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

// TODO  implement search
  async getDataForProcessing(
    subStr: string = '',
    page: number = 1,
    limit: number = 10,
  ) {

    const offset = (page - 1) * limit;

    try {
    const entitiesQuery =
        `SELECT
            p."performerId",
            pr."name" AS "performerName",
            SUM((p."amount" * p."performerRate") / 100) AS "amount"
          FROM
            payments p
          LEFT JOIN
            performers pr ON p."performerId" = pr."id"
          WHERE
            p."payoutId" IS NULL AND p."performerId" IS NOT NULL
          GROUP BY
            p."performerId", pr."name"
          ORDER BY
            "amount" DESC
              LIMIT :limit OFFSET :offset;`

      const totalEntitiesQuery = `SELECT 
           COUNT(DISTINCT p."performerId") as total
          FROM 
           payments p
          WHERE 
            p."payoutId" IS NULL AND p."performerId" IS NOT NULL;`

      const [ entities,  total ] = await Promise.all([
        this.paymentRepository.sequelize.query(entitiesQuery,
          { type: QueryTypes.SELECT,  replacements: { limit, offset }}),
        this.paymentRepository.sequelize.query(totalEntitiesQuery, { type: QueryTypes.SELECT })
      ]);

      const totalPages = Math.ceil(total[0]['total'] / limit);
      const currentPage = page > totalPages ? 1 : page;

      return {
        entities,
        meta: {
          itemCount: total,
          currentPage: currentPage,
          totalPages: totalPages,
        },
      };

    } catch (error) {
      console.error('getGroupedPayments => Error:', error);
      throw new HttpException('Error fetching grouped payments', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDataForProcessingById(id: number) {
    try {
      return await this.paymentRepository.sequelize.query(
        `SELECT
          p."performerId",
          pr."name" AS "performerName",
          COALESCE(SUM(p."amount" * p."performerRate") / 100, 0) AS "amount"
        FROM
          payments p
        LEFT JOIN
          performers pr ON p."performerId" = pr."id"
        WHERE
          p."payoutId" IS NULL 
          AND p."performerId" = :id
        GROUP BY
          p."performerId", pr."name";`,
        { replacements: { id }, type: QueryTypes.SELECT, plain: true }
      );

    } catch (error) {
      console.error('getDataForProcessingById => Error:', error);
      throw new HttpException(
        'Error fetching performer payments',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async savePayout(payout: CreatePayoutDto) {
    try {
      const createdPayout = await this.payoutRepository.create({
        performerId: payout.performerId,
        amount: payout.amount,
        comment: payout.comment || null,
      });

      await this.paymentRepository.update(
        { payoutId: createdPayout.id },
        {
          where: {
            performerId: payout.performerId,
            payoutId: null,
          },
        }
      );

      return {
        status: HttpStatus.OK,
        message: `The payment ${payout.amount} to performer (${payout.performerId}) was successful`,
      };
    } catch (error) {
      console.error('savePayout => Error saving payout:', error);
      throw new HttpException('Error saving payout', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllPayoutsOrSearch(
    subStr: string = '',
    page: number = 1,
    limit: number = 10,) {
    const offset = (page - 1) * limit;

    let whereCondition: any = {};

    if (subStr) {
      whereCondition = {
        [Op.or]: [
          { comment: { [Op.iLike]: `%${subStr}%` } },
          !isNaN(Number(subStr)) && { performerId: { [Op.eq]: Number(subStr) } },
          !isNaN(Number(subStr)) && { id: { [Op.eq]: Number(subStr) } },
          { '$performer.name$': { [Op.iLike]: `%${subStr}%` } },
        ],
      };
    }

    try {
      const { rows: entities, count: totalItems } =
        await this.payoutRepository.findAndCountAll({
          attributes: [
            'id',
            'performerId',
            [Sequelize.col('performer.name'), 'performerName'],
            'comment',
            'amount',
            'createdAt',
          ],
          include: [
            {
              model: PerformerMod,
              attributes: [],
              as: 'performer', // обязательно укажи `as`, если у тебя указано в модели
            },
          ],
          where: whereCondition,
          limit,
          offset,
          order: [['id', 'DESC']],
          raw: true
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
      console.error(`getAllPayoutsOrSearch => Search: ${subStr} not found`, error);
      throw new HttpException(
        `Payouts search error`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async withdrawIfAvailable({type, amount, custom}: IPaymentItem, providerId: number) {
     return firstValueFrom(
        this.httpService.post(this.configService.get<string>('TRANSACTION_CHECK_URL'),
          {
            key: this.configService.get<string>('AUTH_API_KEY'),
            action: `cam-${type}`,
            site_id: this.configService.get<string>('SITE_ID'),
            user_id: providerId,
            amount: amount,
            ...(custom !== undefined && { custom })
          }).pipe(
            map(res => res.data),
            catchError(error => {
              console.error(`withdrawIfAvailable => Member request error`, error.message);
              throw new HttpException(
                `${error?.response?.data?.details?.amount || error?.message}`,
                  HttpStatus.INTERNAL_SERVER_ERROR,
              )
            })
        )
      )
  }

  async getMemberBalance(providerId: number) {
    return firstValueFrom(
      this.httpService.post(
          this.configService.get<string>('MEMBER_BALANCE_URL'),
        {
          key: this.configService.get<string>('AUTH_API_KEY'),
          site_id: this.configService.get<string>('SITE_ID'),
          user_id: providerId,
        }
      ).pipe(
        filter(res => res.status === 200),
        map(res => res.data),
        catchError(error => {
          console.error(`getMemberBalance => Member request error`, error.message);
          throw new HttpException(
            'Check balance error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          )
        })
      )
    )
  }

  async getPayoutByIdForPerformer(performerId: number) {
    return await this.payoutRepository.findAll({
      attributes: [
        'id',
        [Sequelize.col('PayoutMod.createdAt'), 'date'],
        'amount',
        [ Sequelize.col('performer.name'), 'performerName' ],
      ],
      include: [
        {
          model: PerformerMod,
          attributes: [],
        },
      ],
      where: {
        performerId: {
          [Op.eq]: performerId,
        },
      },
      order: [['id', 'DESC']],
    });
  }

  async getPaymentsByIdForPerformer(id: number) {
    try {
      return await this.paymentRepository.findAll({
        where: { performerId: id },
        attributes: [
          'id',
          'type',
          'streamId',
          'payoutId',
          [Sequelize.col('PaymentMod.updatedAt'), 'date'],
          [Sequelize.literal('"PaymentMod"."amount" * "PaymentMod"."performerRate" / 100'), 'amount'],
          [Sequelize.col('member.name'), 'memberName'],
        ],
        include: [
          {
            model: MemberMod,
            attributes: [],
          },
        ],
        order: [['id', 'DESC']],
        raw: true,
      });
    } catch (error) {
      console.error(`getPaymentsByIdForPerformer => Failed to get data`, error);
      throw new HttpException('Payments list error', HttpStatus.BAD_REQUEST);
    }
  }
}
