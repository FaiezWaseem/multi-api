export class AppError extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, statusCode = 400, data: unknown = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.data = data;
  }
}
