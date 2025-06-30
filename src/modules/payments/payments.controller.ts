import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { PaymentResponseDto } from './dto/payment-response-momo';
import { CreatePaymentMomoDto } from './dto/create-payment-momo.dto';
import { Public } from '../auth/decorators/public.decorators';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post('momo')
  @ApiOperation({ summary: 'Create MoMo payment' })
  @ApiBody({ type: CreatePaymentMomoDto })
  @ApiResponse({
    status: 201,
    description: 'Payment created',
    type: PaymentResponseDto,
  })
  async createPaymentMomo(
    @Body() createPaymentDto: CreatePaymentMomoDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.createPaymentMomo(createPaymentDto);
  }
}
