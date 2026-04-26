import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/sequelize';
import { MemberMod } from '../model/member.model';
import { MemberDto } from '../dto/member.dto';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';

@Injectable()
export class MemberService {
  constructor(
    private httpService: HttpService,
    @InjectModel(MemberMod) private memberRepository: typeof MemberMod,
    private configService: ConfigService,
  ) {}

  async getMemberByToken(token: string) {
    const headersRequest = { Authorization: `Bearer ${token}` };

    try {
      const { data: member } = await firstValueFrom(
        this.httpService.get(
          this.configService.get<string>('MEMBER_LOGIN_URL'),
          {
            headers: headersRequest,
          },
        ),
      );

      return member;
    } catch (error) {
      console.error('getMemberByToken => Invalid email or password', error);
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        status: HttpStatus.UNAUTHORIZED,
      });
    }
  }

  async createOrUpdateMember(createMemberDto: MemberDto): Promise<MemberMod> {
    const existingMember = await this.memberRepository.findOne({
      where: { email: createMemberDto.email },
    });

    if (existingMember) {
      existingMember.lastToken = createMemberDto.lastToken;

      if (existingMember.name !== createMemberDto.name) {
        existingMember.name = createMemberDto.name;
      }

      if (existingMember.providerId !== createMemberDto.providerId) {
        existingMember.providerId = createMemberDto.providerId;
      }

      if (existingMember.status !== createMemberDto.status) {
        existingMember.status = createMemberDto.status;
      }

      if (existingMember.lang !== createMemberDto.lang) {
        existingMember.lang = createMemberDto.lang;
      }

      await existingMember.save();
      return existingMember;
    } else {
      return await this.memberRepository.create(createMemberDto);
    }
  }

  async getAllOrSearch(
    subStr: string = '',
    page: number = 1,
    limit: number = 10,
  ) {
    const offset = (page - 1) * limit;

    let whereCondition: any = {};

    if (subStr) {
      whereCondition = {
        [Op.or]: [
          { email: { [Op.iLike]: `%${subStr}%` } },
          { name: { [Op.iLike]: `%${subStr}%` } },
        ],
      };
    }

    try {
      const { rows: entities, count: totalItems } =
        await this.memberRepository.findAndCountAll({
          where: whereCondition,
          attributes: {
            exclude: ['lastToken', 'providerId', 'updatedAt'],
          },
          limit,
          offset,
          order: [['id', 'DESC']],
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
      console.error(`getAllOrSearch => Search: ${subStr} not found:`, error);
      throw new HttpException(
        `Search: ${subStr} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getById(id: number) {
    return this.memberRepository.findOne({
      where: { id },
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

  async changeTokenAmount(memberId: number, currentBalance: number) {
    try {
      const member = await this.getById(memberId);
      member.balance = currentBalance;
      await member.save();

    } catch (error) {
      console.error(`changeTokenAmount => Withdraw error:`, error);
    }
  }
}
