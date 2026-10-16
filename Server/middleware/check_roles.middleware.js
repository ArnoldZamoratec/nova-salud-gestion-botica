import { UnAuthorizedError, ForbiddenError } from "../utils/errors.js";

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!userRole) {
      return next(new UnAuthorizedError("No autorizado"));
    }

    if (!allowedRoles.includes(userRole)) {
      return next(new ForbiddenError("Prohibido: no tienes permiso"));
    }

    next();
  };
};