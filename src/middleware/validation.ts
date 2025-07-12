import type { Request, Response, NextFunction } from "express";
import Ajv from "ajv";
import { BaseErrorException } from "../utils/error_handler";

const ajv = new Ajv({ allErrors: true });

export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validate = ajv.compile(schema);
    const valid = validate(req.body);

    if (!valid) {
      const errors =
        validate.errors?.map((err) => ({
          field: err.instancePath || err.schemaPath,
          message: err.message,
          value: err.data,
        })) || [];

      throw new BaseErrorException({
        message: "Validation failed",
        error: "VALIDATION_ERROR",
        logInfo: { validationErrors: errors },
        code: 400,
      });
    }

    next();
  };
}
