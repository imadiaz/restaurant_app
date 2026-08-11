export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  requestId?: string;
  timestamp?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  errorCode: string; 
  message: string | string[]; 
  data: unknown;
  requestId?: string;
  timestamp?: string;
  path?: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly validationErrors?: string[];
  public readonly requestId?: string;

  constructor(
    message: string, 
    statusCode: number, 
    errorCode?: string, 
    validationErrors?: string[],
    requestId?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.validationErrors = validationErrors;
    this.requestId = requestId;
    
  }
}
