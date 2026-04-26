import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MessageDto } from '../dto/chat.dto';
import { InjectModel } from '@nestjs/sequelize';
import { MessageMod, RequestMessages } from '../model/message.model';
import { Op } from 'sequelize';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(MessageMod)
    private messageRepository: typeof MessageMod,
  ) {}

  async registerMessage(message: MessageDto) {
    try {
      const newMessage = await this.messageRepository.create({ ...message });

      return newMessage || [];
    } catch (error) {
      console.error('registerMessage => Error while saving message:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new HttpException(
          'Message with the same unique constraint already exists.',
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        'Failed to register message.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMessages({
    streamId,
    participantId,
    role,
    nickName,
  }: RequestMessages) {
    try {
      let messages: MessageMod[];

      if (role === 'performer') {
        messages = await this.messageRepository.findAll({
          where: { streamId },
          order: [['createdAt', 'ASC']],
        });
      } else if (role === 'member') {
        messages = await this.messageRepository.findAll({
          where: {
            streamId,
            [Op.or]: [
              { privacy: 'public' },
              { participantId },
              { [Op.and]: [{ privacy: 'private' }, { privateTo: nickName }] },
              { [Op.and]: [{ privacy: 'private' }, { participantId }] },
            ],
          },
          order: [['createdAt', 'ASC']],
        });
      }

      return messages;
    } catch (error) {
      console.error('getMessages => Error while fetching messages:', error);
      throw new HttpException(
        'Failed to fetch messages.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllOrSearch(
    subStr: string | null = null,
    page: number = 1,
    limit: number = 10,
    streamId: string,
  ) {
    const offset = (page - 1) * limit;
    const whereCondition: any = { streamId };

    if (subStr) {
      whereCondition[Op.or] = [
        { message: { [Op.iLike]: `%${subStr}%` } },
        { nickName: { [Op.iLike]: `%${subStr}%` } },
      ];
    }

    const { rows: entities, count: itemCount } =
      await MessageMod.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [['id', 'DESC']],
      });

    const totalPages = Math.ceil(itemCount / limit);

    return {
      entities,
      meta: {
        itemCount,
        currentPage: page,
        totalPages,
      },
    };
  }
}
