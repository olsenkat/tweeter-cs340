import { BadRequestError, InternalServerError, UnauthorizedError } from "../model/errors/Error";

export default function handleError(error: any) {
  if (error instanceof BadRequestError) {
    return {
      statusCode: 400,
      message: error.message,
    };
  }
  else if (error instanceof UnauthorizedError) {
    return {
      statusCode: 401,
      message: error.message,
    };
  }
  else if (error instanceof InternalServerError) {
    return {
        statusCode: 500,
        message: error.message
    }
  }
  return {
    statusCode: 500,
    message: error.message
  }
}
