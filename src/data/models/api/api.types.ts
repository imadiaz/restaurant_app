export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  statusCode: number;
  errorCode: string; 
  message: string | string[]; 
  data: any;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly validationErrors?: string[];

  constructor(
    message: string, 
    statusCode: number, 
    errorCode?: string, 
    validationErrors?: string[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.validationErrors = validationErrors;
    
    // Mantiene el stack trace correcto
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, AppError);
    }
  }
}