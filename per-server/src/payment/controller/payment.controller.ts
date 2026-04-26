import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { Role, RoleGuard } from '../../shared/role.guard';
import { IPaymentItem, PaymentService } from '../payment.service';
import { MemberIdGuard } from '../../member/member-id.guard';

@Controller('/payment')
export class PaymentController {

  constructor(private paymentService: PaymentService) {}

  @Role('member')
  @UseGuards(RoleGuard, MemberIdGuard)
  @Post('/member-pay')
  async payTips(@Body() paymentItem: IPaymentItem) {
    try {
      const userData = await this.paymentService.makePayment(paymentItem);
      if (userData) {
        return {
          status: HttpStatus.OK,
          message: `${paymentItem.amount} tip sent successfully`,
          userData
        };
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: error.message || 'Payment failed',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Role('performer')
  @UseGuards(RoleGuard)
  @Get('/processing/:id')
  async getPerformerBalance(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentService.getDataForProcessingById(id)
  }

  @Role('performer')
  @UseGuards(RoleGuard)
  @Get('/payouts/:id')
  async getPerformerPayouts(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentService.getPayoutByIdForPerformer(id);
  }

  @Role('performer')
  @UseGuards(RoleGuard)
  @Get('/payments/:id')
  async getPerformerPayments(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentService.getPaymentsByIdForPerformer(id);
  }

  @Role('member')
  @UseGuards(RoleGuard, MemberIdGuard)
  @Post('/member-balance/:id')
  async checkMemberBalance(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentService.checkMemberBalance(id)
  }
}
