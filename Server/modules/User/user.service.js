import { UserRepository } from "./user.repository.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../utils/errors.js";
import cloudinary from "../../config/cloudinary.js";
import bcrypt from "bcrypt";

const uploadAvatarToCloudinary = (buffer, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        format: "webp",
        public_id: publicId,
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
};

export const UserService = {
  getUserById: async (id) => {
    const user = await UserRepository.findByIdWithoutSensitiveData(id);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    return user;
  },

  getUserProfile: async (userId) => {
    const user = await UserRepository.findProfileById(userId);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    return user;
  },

  updateAvatar: async (userId, file) => {
    if (!file) throw new BadRequestError("No se envió ninguna imagen");

    const uploadResult = await uploadAvatarToCloudinary(
      file.buffer,
      `avatar_${userId}`,
    );

    return await UserRepository.updateById(userId, {
      avatar: uploadResult.secure_url,
    });
  },

  updateUser: async (id, requesterRole, bodyData) => {
    const targetUser = await UserRepository.findById(id);
    if (!targetUser) throw new NotFoundError("Usuario no encontrado");

    if (targetUser.role === "super_admin" && requesterRole !== "super_admin") {
      throw new ForbiddenError("No se puede modificar a un super administrador");
    }

    const allowedFields = [
      "name",
      "email",
      "phone",
      "date_of_birth",
      "gender",
      "address",
    ];
    const updateData = Object.keys(bodyData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = bodyData[key];
        return obj;
      }, {});

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError("No se enviaron campos válidos");
    }

    if (updateData.email && updateData.email !== targetUser.email) {
      const emailExists = await UserRepository.findEmailInUseByOthers(
        updateData.email,
        id,
      );
      if (emailExists) throw new BadRequestError("El correo ya está en uso");
    }

    if (updateData.address) {
      updateData.address = { ...targetUser.address, ...updateData.address };
    }

    return await UserRepository.updateById(id, updateData);
  },

  updateUserRole: async (id, newRole, requesterRole) => {
    const targetUser = await UserRepository.findById(id);
    if (!targetUser) throw new NotFoundError("Usuario no encontrado");

    if (targetUser.role === "super_admin") {
      throw new ForbiddenError("No se puede modificar el rol de un super administrador");
    }

    if (requesterRole === "admin" && newRole === "super_admin") {
      throw new ForbiddenError("Los administradores no pueden asignar el rol super_admin");
    }

    targetUser.role = newRole;
    await UserRepository.saveUser(targetUser);

    return { _id: targetUser._id, role: targetUser.role };
  },

  createUser: async (creatorRole, userData) => {
    const { name, email, password, phone, role } = userData;

    if (creatorRole === "admin" && role === "super_admin") {
      throw new ForbiddenError(
        "Los administradores no pueden crear cuentas super_admin",
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserRepository.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "user",
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;
    return userResponse;
  },

  getAllUsers: async (queryParams) => {
    const {
      page = 1,
      limit = 10,
      role,
      is_active,
      gender,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const filter = { role: { $ne: "super_admin" }, is_deleted: false };

    if (role && role !== "super_admin") filter.role = role;
    if (is_active !== undefined) filter.is_active = is_active === "true";
    if (gender) filter.gender = gender;

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { communications_email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const allowedSortFields = ["createdAt", "name", "email", "role"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortObj = { [sortField]: sortDirection };

    const [users, total] = await Promise.all([
      UserRepository.findUsersPaginated(filter, skip, limitNum, sortObj),
      UserRepository.countUsers(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  },

  deleteUser: async (id) => {
    const user = await UserRepository.findById(id);
    if (!user) throw new NotFoundError("Usuario no encontrado");

    if (user.role === "super_admin") {
      throw new ForbiddenError("No se puede eliminar a un super administrador");
    }

    user.is_deleted = true;
    user.is_active = false;
    await UserRepository.saveUser(user);
  },

  toggleUserActive: async (id, is_active) => {
    const user = await UserRepository.findById(id);
    if (!user) throw new NotFoundError("Usuario no encontrado");

    if (user.role === "super_admin") {
      throw new ForbiddenError("No se puede cambiar el estado de un super administrador");
    }

    user.is_active = is_active;
    await UserRepository.saveUser(user);

    return is_active;
  },

  getCouriersList: async () => {
    return await UserRepository.findCouriers();
  },

  searchUsersIdsByName: async (regex) => {
    return await UserRepository.findMatchingUsers(regex);
  },
  countUsers: async (query) => await UserRepository.countUsers(query),

  getUsersByIds: async (userIds, selectFields) =>
    await UserRepository.findUsersByIds(userIds, selectFields),

  findCourierById: async (courierId) => {
    return await UserRepository.findCourierById(courierId);
  },

  getAuthUser: async (id) => {
    return await UserRepository.findUserForAuth(id);
  },
};
