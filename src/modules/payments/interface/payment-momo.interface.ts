export interface MomoPaymentRequest {
  partnerCode: string;
  partnerName: string;
  storeId: string;
  requestId: string;
  amount: string;
  orderId: string;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  lang: string;
  requestType: string;
  autoCapture: boolean;
  extraData: string;
  orderGroupId: string;
  signature: string;
}

export interface MomoConfig {
    accessKey: string;
    secretKey: string;
    partnerCode: string;
    redirectUrl: string;
    ipnUrl: string;
}
