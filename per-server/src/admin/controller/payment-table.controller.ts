import { Role, RoleGuard } from '../../shared/role.guard';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CreatePayoutDto } from '../../payment/dto/payout.dto';
import { PaymentService } from '../../payment/payment.service';

@Role('admin')
@UseGuards(RoleGuard)
@Controller('/admin')
export class PaymentTableController {
  constructor(
    private paymentService: PaymentService,
  ) {}

  @Get('/payment/all')
  async getAllPayments(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.paymentService.getAllPaymentsOrSearch(subStr, page, limit);
  }

  @Get('/payment/processing')
  async getDataForProcessing(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.paymentService.getDataForProcessing(subStr, page, limit);
  }

  @Get('/payment/processing/:id')
  async getDataForProcessingById(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentService.getDataForProcessingById(id)
  }

  @Post('/payment/pay')
  async processPay$(@Body() payData: CreatePayoutDto ) {
    return await this.paymentService.savePayout(payData);
  }

  @Get('/payment/payouts')
  async getPayout(
    @Query('subStr') subStr: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.paymentService.getAllPayoutsOrSearch(subStr, page, limit);
  }
}
