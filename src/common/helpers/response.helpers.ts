export const formatResponse = (
  data: any,
  message = 'Request successful',
  meta?: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  },
) => {
  const isArray = Array.isArray(data);
  return {
    status: 'success',
    message,
    data: isArray ? { items: data } : { item: data },
    ...(meta && { meta }),
  };
};

export const formatErrorResponse = (
  message = 'Something went wrong',
  statusCode = 400,
) => {
  return {
    status: 'error',
    message,
    statusCode,
    data: null,
  };
};
