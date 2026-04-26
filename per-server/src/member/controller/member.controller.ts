import { Body, Controller, Post, Req } from '@nestjs/common';
import { MemberService } from '../service/member.service';
import { MemberDto } from '../dto/member.dto';
import { CryptService } from '../../crypt/crypt.service';
import { IPayload } from '../../shared/entity.abstract.service';
import { RolesService } from '../../roles/roles.service';

export interface IMemberToken {
  token: string;
}

@Controller()
export class MemberController {
  ROLE = 'member';

  constructor(
    private memberService: MemberService,
    private cryptService: CryptService,
    private roleService: RolesService,
  ) {}

  @Post('/member-login')
  async login(@Body() { token }: IMemberToken, @Req() request: Request) {
    // for ignore 'OPTIONAL' request
    const auth = request.headers['authorization'].split(' ')[1];
    if (!auth) {
      return;
    }

    const { id, email, name, balance, lang } =
      await this.memberService.getMemberByToken(token);

    const dataCreatingMember: MemberDto = {
      providerId: id,
      email: email,
      name: name,
      status: 'premium', //TODO <- webcam-demo.bunny-cms.com
      lastToken: token,
      balance: Number(balance) || 0,
      lang: lang,
    };

    const savedMember =
      await this.memberService.createOrUpdateMember(dataCreatingMember);

    const payload: IPayload = {
      id: savedMember.id,
      email: savedMember.email,
      role: [this.ROLE],
      nickName: savedMember.name,
    };

    const encryptedCoinsData = await this.cryptService.encryptCoins(
      dataCreatingMember.balance,
    );

    const role = await this.roleService.getRoleByValue(this.ROLE);
    await this.roleService.saveUserRole(payload.id, role);

    const tokenData = await this.cryptService.makeToken(payload);

    return { ...tokenData, userData: encryptedCoinsData, lang };
  }
}
