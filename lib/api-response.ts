export type ApiResponse<T = unknown> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
};

export function createSuccessResponse<T>(
  message: string,
  data: T,
  statusCode = 200,
): ApiResponse<T> {
  return {
    statusCode,
    success: true,
    message,
    data,
  };
}

export function createErrorResponse(
  message: string,
  statusCode: number,
  data: unknown = null,
): ApiResponse {
  return {
    statusCode,
    success: false,
    message,
    data,
  };
}
