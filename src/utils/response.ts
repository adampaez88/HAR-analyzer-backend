export const successResponse = (data: any) => ({
  success: true,
  data,
});

export const errorResponse = (message: string) => ({
  success: false,
  error: message,
});