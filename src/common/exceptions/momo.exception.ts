import { HttpException, HttpStatus } from '@nestjs/common';

export class MoMoException extends HttpException {
  constructor(resultCode: number, message: string) {
    const errorInfo = getMoMoErrorInfo(resultCode);

    super(
      {
        statusCode: errorInfo.httpStatus,
        message: message || errorInfo.defaultMessage,
        resultCode,
        errorType: errorInfo.errorType,
        canRetry: errorInfo.canRetry,
        suggestion: errorInfo.suggestion,
      },
      errorInfo.httpStatus,
    );
  }
}

interface MoMoErrorInfo {
  httpStatus: HttpStatus;
  defaultMessage: string;
  errorType:
    | 'System error'
    | 'Merchant error'
    | 'User error'
    | 'Pending'
    | 'Success';
  canRetry: boolean;
  suggestion?: string;
}

function getMoMoErrorInfo(resultCode: number): MoMoErrorInfo {
  const errorMap: Record<number, MoMoErrorInfo> = {
    0: {
      httpStatus: HttpStatus.OK,
      defaultMessage: 'Successful',
      errorType: 'Success',
      canRetry: false,
    },
    10: {
      httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
      defaultMessage: 'System is under maintenance',
      errorType: 'System error',
      canRetry: true,
      suggestion: 'Please retry after the maintenance is over',
    },
    11: {
      httpStatus: HttpStatus.FORBIDDEN,
      defaultMessage: 'Access denied',
      errorType: 'System error',
      canRetry: false,
      suggestion:
        'Merchant settings issue. Please check your settings in M4B portal, or contact MoMo for configurations',
    },
    12: {
      httpStatus: HttpStatus.BAD_REQUEST,
      defaultMessage: 'Unsupported API version for this request',
      errorType: 'System error',
      canRetry: false,
      suggestion:
        'Please upgrade to our latest version of payment gateway as the current version is no longer in support',
    },
    13: {
      httpStatus: HttpStatus.UNAUTHORIZED,
      defaultMessage: 'Merchant authentication failed',
      errorType: 'Merchant error',
      canRetry: false,
      suggestion:
        'Please check your credentials and the ones provided in M4B portal',
    },
    20: {
      httpStatus: HttpStatus.BAD_REQUEST,
      defaultMessage: 'Bad format request',
      errorType: 'Merchant error',
      canRetry: false,
      suggestion: 'Please check the request format or any missing parameters',
    },
    21: {
      httpStatus: HttpStatus.BAD_REQUEST,
      defaultMessage: 'Request rejected due to invalid transaction amount',
      errorType: 'Merchant error',
      canRetry: false,
      suggestion:
        'Please check if the amount is irrelevant and retry a request',
    },
    22: {
      httpStatus: HttpStatus.BAD_REQUEST,
      defaultMessage: 'The transaction amount is out of range',
      errorType: 'Merchant error',
      canRetry: false,
      suggestion:
        'Please check if the amount is within the allowed range of each payment method. For capture requestType, check if the capture amount match the authorized amount',
    },
    40: {
      httpStatus: HttpStatus.CONFLICT,
      defaultMessage: 'Duplicated requestId',
      errorType: 'Merchant error',
      canRetry: false,
      suggestion: 'Please retry with a different requestID',
    },
    41: {
      httpStatus: HttpStatus.CONFLICT,
      defaultMessage: 'Duplicated orderId',
      errorType: 'Merchant error',
      canRetry: false,
      suggestion:
        "Please inquiry the orderId's transaction status, or retry with a different orderId",
    },
    42: {
      httpStatus: HttpStatus.NOT_FOUND,
      defaultMessage: 'Invalid orderId or orderId is not found',
      errorType: 'Merchant error',
      canRetry: false,
      suggestion: 'Please retry with a different orderId',
    },
    43: {
      httpStatus: HttpStatus.CONFLICT,
      defaultMessage:
        'Request rejected due to an analogous transaction is being processed',
      errorType: 'Merchant error',
      canRetry: false,
      suggestion:
        'Before retry, please check if another analogous transaction is being processed which restricts this request',
    },
    45: {
      httpStatus: HttpStatus.CONFLICT,
      defaultMessage: 'Duplicated ItemId',
      errorType: 'Merchant error',
      canRetry: false,
      suggestion: 'Please check and retry the request with unique ItemId',
    },
    47: {
      httpStatus: HttpStatus.BAD_REQUEST,
      defaultMessage:
        'Request rejected due to inapplicable information in the given set of valuable data',
      errorType: 'System error',
      canRetry: false,
      suggestion: 'Please review and retry with another request',
    },
    98: {
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      defaultMessage:
        'This QR Code has not been generated successfully. Please try again later',
      errorType: 'System error',
      canRetry: true,
      suggestion: 'Please retry with another request',
    },
    99: {
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      defaultMessage: 'Unknown error',
      errorType: 'System error',
      canRetry: true,
      suggestion: 'Please contact MoMo for more details',
    },
    1000: {
      httpStatus: HttpStatus.ACCEPTED,
      defaultMessage: 'Transaction is initiated, waiting for user confirmation',
      errorType: 'Pending',
      canRetry: false,
      suggestion:
        'The transaction is still waiting for the user confirmation, the transaction state will change after user confirms or cancels the payment',
    },
    1001: {
      httpStatus: HttpStatus.PAYMENT_REQUIRED,
      defaultMessage: 'Transaction failed due to insufficient funds',
      errorType: 'Merchant error',
      canRetry: true,
    },
    1002: {
      httpStatus: HttpStatus.PAYMENT_REQUIRED,
      defaultMessage:
        'Transaction rejected by the issuers of the payment methods',
      errorType: 'User error',
      canRetry: true,
      suggestion: 'Please choose other payment methods',
    },
    1003: {
      httpStatus: HttpStatus.PAYMENT_REQUIRED,
      defaultMessage: 'Transaction cancelled after successfully authorized',
      errorType: 'Merchant error',
      canRetry: true,
      suggestion:
        'The transaction was canceled by merchant or MoMo system due to timeout handlers. Please mark the transaction as failed',
    },
    1004: {
      httpStatus: HttpStatus.PAYMENT_REQUIRED,
      defaultMessage:
        'Transaction failed because the amount exceeds daily/monthly payment limit',
      errorType: 'User error',
      canRetry: true,
      suggestion:
        'Please mark the transaction as failed, and retry another day',
    },
    1005: {
      httpStatus: HttpStatus.GONE,
      defaultMessage: 'Transaction failed because the url or QR code expired',
      errorType: 'System error',
      canRetry: true,
      suggestion: 'Please send another payment request',
    },
    1006: {
      httpStatus: HttpStatus.PAYMENT_REQUIRED,
      defaultMessage:
        'Transaction failed because user has denied to confirm the payment',
      errorType: 'User error',
      canRetry: true,
      suggestion: 'Please send another payment request',
    },
    1007: {
      httpStatus: HttpStatus.FORBIDDEN,
      defaultMessage:
        "Transaction rejected due to inactive or nonexistent user's account",
      errorType: 'System error',
      canRetry: true,
      suggestion:
        'Please ensure the account status should be active/verified before retrying or contact MoMo for support',
    },
    1017: {
      httpStatus: HttpStatus.PAYMENT_REQUIRED,
      defaultMessage: 'Transaction cancelled by merchant',
      errorType: 'Merchant error',
      canRetry: true,
    },
    1026: {
      httpStatus: HttpStatus.FORBIDDEN,
      defaultMessage: 'Transaction restricted due to promotion rules',
      errorType: 'System error',
      canRetry: true,
      suggestion: 'Please contact MoMo for the restriction details',
    },
    1080: {
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      defaultMessage:
        'Refund attempt failed during the processing. Please retry within a short period, preferably after an hour',
      errorType: 'Merchant error',
      canRetry: true,
      suggestion:
        'Please check if the original orderId or transId used in the request is correct, then retry to refund later (recommended to be in 1 hour for payment transaction that was processed longer than 1 month ago)',
    },
    1081: {
      httpStatus: HttpStatus.CONFLICT,
      defaultMessage:
        'Refund rejected. The original transaction might have been refunded',
      errorType: 'Merchant error',
      canRetry: true,
      suggestion:
        'Please check if the original transaction has already been refunded, or the amount of your refund request exceeds the refundable amount',
    },
    1088: {
      httpStatus: HttpStatus.FORBIDDEN,
      defaultMessage:
        'Refund rejected. The original payment transaction is ineligible to be refunded',
      errorType: 'Merchant error',
      canRetry: true,
      suggestion: 'Please contact MoMo for the restriction details',
    },
    2019: {
      httpStatus: HttpStatus.BAD_REQUEST,
      defaultMessage: 'Request rejected due to invalid orderGroupId',
      errorType: 'Merchant error',
      canRetry: true,
      suggestion: 'Please contact MoMo for the restriction details',
    },
    4001: {
      httpStatus: HttpStatus.FORBIDDEN,
      defaultMessage:
        'Transaction rejected because the user account is being restricted',
      errorType: 'User error',
      canRetry: true,
      suggestion:
        'Please contact MoMo for the restriction details of this certain user account',
    },
    4002: {
      httpStatus: HttpStatus.FORBIDDEN,
      defaultMessage:
        'Transaction rejected because the user account has not been verified by C06',
      errorType: 'User error',
      canRetry: true,
      suggestion:
        'Users must update their biometrics via NFC to be authorized for the transaction',
    },
    4100: {
      httpStatus: HttpStatus.UNAUTHORIZED,
      defaultMessage: 'Transaction failed because user has failed to login',
      errorType: 'User error',
      canRetry: true,
    },
    7000: {
      httpStatus: HttpStatus.ACCEPTED,
      defaultMessage: 'Transaction is being processed',
      errorType: 'Pending',
      canRetry: false,
      suggestion: 'Please wait for the transaction to be fully processed',
    },
    7002: {
      httpStatus: HttpStatus.ACCEPTED,
      defaultMessage:
        'Transaction is being processed by the provider of the payment instrument selected',
      errorType: 'Pending',
      canRetry: false,
      suggestion:
        "Please wait for the transaction to be processed. The transaction status will be notified once it's done processing",
    },
    9000: {
      httpStatus: HttpStatus.OK,
      defaultMessage: 'Transaction is authorized successfully',
      errorType: 'Pending',
      canRetry: false,
      suggestion:
        'For 1-step payment, please mark this transaction as success. For 2-step payment, please proceed with either capture or cancel request. For binding, please proceed to request the recurring token',
    },
  };

  return (
    errorMap[resultCode] || {
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      defaultMessage: 'Unknown MoMo error',
      errorType: 'System error',
      canRetry: false,
    }
  );
}
