import { BadRequestError } from "../utils/errors.js";
import { joiMessagesEs } from "../utils/joiMessages.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: true, messages: joiMessagesEs });

    if (error) {
      return next(new BadRequestError(error.details.map((err) => err.message)));
    }

    req.body = value;
    next();
  };
};
