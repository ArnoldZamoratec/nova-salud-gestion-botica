import { NotFoundError } from "../utils/errors.js";

export const notFoundMiddleware = (req, res, next) => {
  next(new NotFoundError(`Ruta ${req.originalUrl} no encontrada`));
};
