import { UserService } from "./user.service.js";

export const GetUserByIdController = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json({ message: "Usuario obtenido correctamente", data: user });
  } catch (error) {
    next(error);
  }
};

export const GetUserProfileController = async (req, res, next) => {
  try {
    const user = await UserService.getUserProfile(req.user._id);
    res
      .status(200)
      .json({ message: "Perfil obtenido correctamente", data: user });
  } catch (error) {
    next(error);
  }
};

export const UpdateAvatarController = async (req, res, next) => {
  try {
    const user = await UserService.updateAvatar(req.user.id, req.file);
    res
      .status(200)
      .json({ message: "Foto de perfil actualizada correctamente", data: user });
  } catch (error) {
    next(error);
  }
};

export const UpdateUserController = async (req, res, next) => {
  try {
    const updatedUser = await UserService.updateUser(
      req.params.id,
      req.user.role,
      req.body,
    );
    res
      .status(200)
      .json({ message: "Usuario actualizado correctamente", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const UpdateUserRoleController = async (req, res, next) => {
  try {
    const data = await UserService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user.role,
    );
    res.status(200).json({ message: "Rol del usuario actualizado correctamente", data });
  } catch (error) {
    next(error);
  }
};

export const CreateUserController = async (req, res, next) => {
  try {
    const userResponse = await UserService.createUser(req.user.role, req.body);
    res
      .status(201)
      .json({ message: "Usuario creado correctamente", data: userResponse });
  } catch (error) {
    next(error);
  }
};

export const GetAllUsersController = async (req, res, next) => {
  try {
    const result = await UserService.getAllUsers(req.query);
    res
      .status(200)
      .json({
        message: "Usuarios obtenidos correctamente",
        data: result.users,
        pagination: result.pagination,
      });
  } catch (error) {
    next(error);
  }
};

export const DeleteUserController = async (req, res, next) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};

export const ToggleUserActiveController = async (req, res, next) => {
  try {
    const isActive = await UserService.toggleUserActive(
      req.params.id,
      req.body.is_active,
    );
    res
      .status(200)
      .json({
        message: `Usuario ${isActive ? "activado" : "desactivado"} correctamente`,
      });
  } catch (error) {
    next(error);
  }
};

export const GetCouriersListController = async (req, res, next) => {
  try {
    const couriers = await UserService.getCouriersList();
    res
      .status(200)
      .json({ message: "Repartidores obtenidos correctamente", data: couriers });
  } catch (error) {
    next(error);
  }
};
