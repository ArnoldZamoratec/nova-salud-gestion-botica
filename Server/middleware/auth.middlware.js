import { verifyToken } from "../services/jwt.service.js";
import { UserService } from "../modules/User/user.service.js";
import { UnAuthorizedError } from "../utils/errors.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new UnAuthorizedError("Token no proporcionado");
    }

    const decoded = verifyToken(token);

    const user = await UserService.getAuthUser(decoded.id);

    if (!user || user.is_deleted || !user.is_active) {
      throw new UnAuthorizedError("Token inválido o expirado");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
