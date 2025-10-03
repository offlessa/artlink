import { Response } from "express";

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: HttpStatusCode;
  };
}

export interface SuccessResponse {
  success: true;
  data: any;
  statusCode: HttpStatusCode;
}

export type ServiceResponse = ErrorResponse | SuccessResponse;

export const createError = (
  message: string,
  statusCode: HttpStatusCode
): ErrorResponse => {
  return {
    success: false,
    error: {
      message,
      statusCode,
    },
  };
};

export const createSuccess = (
  data: any,
  statusCode: HttpStatusCode = HttpStatusCode.CREATED
): SuccessResponse => {
  return {
    success: true,
    data,
    statusCode,
  };
};

export const sendResponse = (res: Response, result: ServiceResponse) => {
  if (!result.success) {
    return res.status(result.error.statusCode).json({
      success: false,
      message: result.error.message,
    });
  }

  return res.status(result.statusCode).json({
    success: true,
    data: result.data,
  });
};
