export const formatResponse = (
  data: any,
  message = 'Request successful',
  meta?: { total: number; page: number; limit: number },
) => {
  const isArray = Array.isArray(data);
  return {
    status: 'success',
    message,
    data: isArray ? { items: data } : { item: data },
    ...(meta && { meta }),
  };
};
