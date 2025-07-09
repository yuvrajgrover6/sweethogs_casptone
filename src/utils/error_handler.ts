import Ajv from "ajv";
import { AxiosError } from "axios";

const basicErrorResults = (e: unknown, defaultMessage: string): BaseError => {
  if (e instanceof BaseErrorException) {
    return { message: e.message, error: e.error, code: e.code };
  }

  if (e instanceof AxiosError) {
    return {
      message: defaultMessage,
      error: `axios-error-${e.code}`,
      code: 500,
    };
  }

  return { message: defaultMessage, error: String(e), code: 500 };
};
export { basicErrorResults };

export class BaseErrorException {
  message: string;
  error: string;
  info: unknown;
  code: number;
  constructor(data: {
    message: string;
    error: string;
    logInfo: unknown;
    code: number;
  }) {
    this.message = data.message;
    this.error = data.error;
    this.info = data.logInfo;
    this.code = data.code;
  }
}

export type BaseError = {
  message: string;
  error: string;
  code: number;
};
const ajv = new Ajv();
export const validateData = (schema: object, body: object) => {
  const validate = ajv.validate(schema, body);
  if (!validate) {
    const validationError = ajv.errorsText();
    throw new BaseErrorException({
      message: validationError,
      error: "invalid-data",
      logInfo: null,
      code: 400,
    });
  }
};
