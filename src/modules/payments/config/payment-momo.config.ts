export const MOMO_CONFIG = {
  ACCESS_KEY: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  SECRET_KEY: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  PARTNER_CODE: 'MOMO',
  REQUEST_TYPE: 'payWithMethod',
  BASE_URL: 'https://test-payment.momo.vn',
  PATH: '/v2/gateway/api/create',
  LANG: 'vi',
};
