import { Injectable } from '@nestjs/common';
import {
  MomoConfig,
  MomoPaymentRequest,
} from './interface/payment-momo.interface';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { MOMO_CONFIG } from './config/payment-momo.config';
import { CreatePaymentMomoDto } from './dto/create-payment-momo.dto';
import { PaymentResponseDto } from './dto/payment-response-momo';
import { firstValueFrom } from 'rxjs';
import { createHmac } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly config: MomoConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.config = {
      accessKey: MOMO_CONFIG.ACCESS_KEY,
      secretKey: MOMO_CONFIG.SECRET_KEY,
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      redirectUrl: this.configService.get('MOMO_REDIRECT_URL') as string,
      ipnUrl: this.configService.get('MOMO_IPN_URL') as string,
    };
  }

  async createPaymentMomo(
    createPaymentMomoDto: CreatePaymentMomoDto,
  ): Promise<PaymentResponseDto> {
    const {
      amount,
      orderInfo,
      extraData = '',
      orderGroupId = '',
      autoCapture = true,
      lang = MOMO_CONFIG.LANG,
    } = createPaymentMomoDto;

    const orderId = this.config.partnerCode + new Date().getTime();
    const requestId = orderId;

    const rawSignature = this.generateRawSignature({
      amount: amount.toString(),
      orderId,
      orderInfo,
      extraData,
      requestId,
      requestType: MOMO_CONFIG.REQUEST_TYPE,
    });

    const signature = this.generateSignature(rawSignature);

    const requestBody: MomoPaymentRequest = {
      partnerCode: this.config.partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      redirectUrl: this.config.redirectUrl,
      ipnUrl: this.config.ipnUrl,
      lang,
      requestType: MOMO_CONFIG.REQUEST_TYPE,
      autoCapture,
      extraData,
      orderGroupId,
      signature,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${MOMO_CONFIG.BASE_URL}${MOMO_CONFIG.PATH}`,
          requestBody,
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  private generateRawSignature(params: {
    amount: string;
    orderId: string;
    orderInfo: string;
    extraData: string;
    requestId: string;
    requestType: string;
  }): string {
    return (
      `accessKey=${this.config.accessKey}` +
      `&amount=${params.amount}` +
      `&extraData=${params.extraData}` +
      `&ipnUrl=${this.config.ipnUrl}` +
      `&orderId=${params.orderId}` +
      `&orderInfo=${params.orderInfo}` +
      `&partnerCode=${this.config.partnerCode}` +
      `&redirectUrl=${this.config.redirectUrl}` +
      `&requestId=${params.requestId}` +
      `&requestType=${params.requestType}`
    );
  }

  private generateSignature(rawSignature: string): string {
    return createHmac('sha256', this.config.secretKey)
      .update(rawSignature)
      .digest('hex');
  }
}
