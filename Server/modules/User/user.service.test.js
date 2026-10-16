import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "./user.service.js";
import { UserRepository } from "./user.repository.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../utils/errors.js";
import cloudinary from "../../config/cloudinary.js";
import bcrypt from "bcrypt";

vi.mock("./user.repository.js");
vi.mock("bcrypt");
vi.mock("../../config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}));

describe("UserService", () => {
  const mockUserId = "user123";

  beforeEach(() => {
    vi.clearAllMocks();
    cloudinary.uploader.upload_stream.mockImplementation((options, cb) => {
      cb(null, { secure_url: "https://cloudinary.com/avatar.webp" });
      return { end: vi.fn() };
    });
  });

  describe("getUserById", () => {
    it("lanza NotFoundError si el usuario no existe", async () => {
      UserRepository.findByIdWithoutSensitiveData.mockResolvedValue(null);
      await expect(UserService.getUserById(mockUserId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("devuelve el usuario si existe", async () => {
      const mockUser = { _id: mockUserId, name: "Test" };
      UserRepository.findByIdWithoutSensitiveData.mockResolvedValue(mockUser);
      const result = await UserService.getUserById(mockUserId);
      expect(result).toEqual(mockUser);
    });
  });

  describe("getUserProfile", () => {
    it("lanza NotFoundError si el perfil no existe", async () => {
      UserRepository.findProfileById.mockResolvedValue(null);
      await expect(UserService.getUserProfile(mockUserId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("devuelve el perfil si existe", async () => {
      const mockProfile = { _id: mockUserId, email: "test@test.com" };
      UserRepository.findProfileById.mockResolvedValue(mockProfile);
      const result = await UserService.getUserProfile(mockUserId);
      expect(result).toEqual(mockProfile);
    });
  });

  describe("updateAvatar", () => {
    it("lanza BadRequestError si no se envía archivo", async () => {
      await expect(UserService.updateAvatar(mockUserId, null)).rejects.toThrow(
        BadRequestError,
      );
    });

    it("sube la imagen y actualiza el repositorio", async () => {
      const mockFile = { buffer: Buffer.from("test") };
      UserRepository.updateById.mockResolvedValue({
        avatar: "https://cloudinary.com/avatar.webp",
      });

      const result = await UserService.updateAvatar(mockUserId, mockFile);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(UserRepository.updateById).toHaveBeenCalledWith(mockUserId, {
        avatar: "https://cloudinary.com/avatar.webp",
      });
      expect(result.avatar).toBe("https://cloudinary.com/avatar.webp");
    });
  });

  describe("updateUser", () => {
    it("lanza NotFoundError si el usuario objetivo no existe", async () => {
      UserRepository.findById.mockResolvedValue(null);
      await expect(
        UserService.updateUser(mockUserId, "admin", {}),
      ).rejects.toThrow(NotFoundError);
    });

    it("lanza ForbiddenError si alguien que no es super_admin intenta modificar a un super_admin", async () => {
      UserRepository.findById.mockResolvedValue({ role: "super_admin" });
      await expect(
        UserService.updateUser(mockUserId, "admin", {}),
      ).rejects.toThrow(ForbiddenError);
    });

    it("lanza BadRequestError si no hay campos válidos", async () => {
      UserRepository.findById.mockResolvedValue({ role: "user" });
      await expect(
        UserService.updateUser(mockUserId, "user", { invalid: "field" }),
      ).rejects.toThrow(BadRequestError);
    });

    it("lanza BadRequestError si otro usuario ya usa el correo", async () => {
      UserRepository.findById.mockResolvedValue({
        role: "user",
        email: "old@test.com",
      });
      UserRepository.findEmailInUseByOthers.mockResolvedValue(true);

      await expect(
        UserService.updateUser(mockUserId, "user", { email: "new@test.com" }),
      ).rejects.toThrow(BadRequestError);
    });

    it("actualiza al usuario filtrando campos inválidos y combinando la dirección", async () => {
      const targetUser = {
        role: "user",
        email: "old@test.com",
        address: { city: "Cairo", street: "Old St" },
      };
      UserRepository.findById.mockResolvedValue(targetUser);
      UserRepository.updateById.mockResolvedValue({ updated: true });

      await UserService.updateUser(mockUserId, "user", {
        name: "New Name",
        invalid_field: "drop",
        address: { street: "New St" },
      });

      expect(UserRepository.updateById).toHaveBeenCalledWith(mockUserId, {
        name: "New Name",
        address: { city: "Cairo", street: "New St" },
      });
    });
  });

  describe("updateUserRole", () => {
    it("lanza NotFoundError si el usuario no existe", async () => {
      UserRepository.findById.mockResolvedValue(null);
      await expect(
        UserService.updateUserRole(mockUserId, "admin", "super_admin"),
      ).rejects.toThrow(NotFoundError);
    });

    it("lanza ForbiddenError si el usuario objetivo es super_admin", async () => {
      UserRepository.findById.mockResolvedValue({ role: "super_admin" });
      await expect(
        UserService.updateUserRole(mockUserId, "user", "super_admin"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("lanza ForbiddenError si un administrador intenta asignar el rol super_admin", async () => {
      UserRepository.findById.mockResolvedValue({ role: "user" });
      await expect(
        UserService.updateUserRole(mockUserId, "super_admin", "admin"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("actualiza el rol y guarda al usuario", async () => {
      const mockUser = { _id: mockUserId, role: "user" };
      UserRepository.findById.mockResolvedValue(mockUser);
      UserRepository.saveUser.mockResolvedValue(true);

      const result = await UserService.updateUserRole(
        mockUserId,
        "admin",
        "super_admin",
      );

      expect(mockUser.role).toBe("admin");
      expect(UserRepository.saveUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ _id: mockUserId, role: "admin" });
    });
  });

  describe("createUser", () => {
    it("lanza ForbiddenError si un administrador crea un super_admin", async () => {
      await expect(
        UserService.createUser("admin", { role: "super_admin" }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("cifra la contraseña, crea el usuario y omite la contraseña en la respuesta", async () => {
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedPassword");

      const mockCreatedUser = {
        _id: "new123",
        name: "John",
        password: "hashedPassword",
        toObject: function () {
          return { ...this };
        },
      };
      UserRepository.createUser.mockResolvedValue(mockCreatedUser);

      const result = await UserService.createUser("admin", {
        name: "John",
        email: "john@test.com",
        password: "123",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("123", "salt");
      expect(UserRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "hashedPassword",
          role: "user",
        }),
      );
      expect(result.password).toBeUndefined();
      expect(result.name).toBe("John");
    });
  });

  describe("getAllUsers", () => {
    it("aplica filtros, búsqueda, orden y paginación correctamente", async () => {
      UserRepository.findUsersPaginated.mockResolvedValue([{ name: "User1" }]);
      UserRepository.countUsers.mockResolvedValue(25);

      const result = await UserService.getAllUsers({
        page: 2,
        limit: 10,
        role: "admin",
        is_active: "true",
        search: "test",
        sortBy: "name",
        sortOrder: "asc",
      });

      expect(UserRepository.findUsersPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "admin",
          is_active: true,
          is_deleted: false,
          $or: expect.any(Array),
        }),
        10,
        10,
        { name: 1 },
      );
      expect(result.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });
  });

  describe("deleteUser", () => {
    it("lanza NotFoundError si el usuario no existe", async () => {
      UserRepository.findById.mockResolvedValue(null);
      await expect(UserService.deleteUser(mockUserId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("lanza ForbiddenError al intentar eliminar a un super_admin", async () => {
      UserRepository.findById.mockResolvedValue({ role: "super_admin" });
      await expect(UserService.deleteUser(mockUserId)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it("elimina lógicamente al usuario", async () => {
      const mockUser = { _id: mockUserId, is_deleted: false, is_active: true };
      UserRepository.findById.mockResolvedValue(mockUser);
      UserRepository.saveUser.mockResolvedValue(true);

      await UserService.deleteUser(mockUserId);

      expect(mockUser.is_deleted).toBe(true);
      expect(mockUser.is_active).toBe(false);
      expect(UserRepository.saveUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("toggleUserActive", () => {
    it("lanza NotFoundError si el usuario no existe", async () => {
      UserRepository.findById.mockResolvedValue(null);
      await expect(
        UserService.toggleUserActive(mockUserId, false),
      ).rejects.toThrow(NotFoundError);
    });

    it("lanza ForbiddenError al intentar activar/desactivar a un super_admin", async () => {
      UserRepository.findById.mockResolvedValue({ role: "super_admin" });
      await expect(
        UserService.toggleUserActive(mockUserId, false),
      ).rejects.toThrow(ForbiddenError);
    });

    it("alterna el estado activo y guarda", async () => {
      const mockUser = { _id: mockUserId, is_active: true };
      UserRepository.findById.mockResolvedValue(mockUser);

      const result = await UserService.toggleUserActive(mockUserId, false);

      expect(mockUser.is_active).toBe(false);
      expect(UserRepository.saveUser).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(false);
    });
  });

  describe("Métodos de paso directo", () => {
    it("llama correctamente a los métodos del repositorio", async () => {
      UserService.getCouriersList();
      expect(UserRepository.findCouriers).toHaveBeenCalled();

      UserService.searchUsersIdsByName("test");
      expect(UserRepository.findMatchingUsers).toHaveBeenCalledWith("test");

      UserService.countUsers({ role: "user" });
      expect(UserRepository.countUsers).toHaveBeenCalledWith({ role: "user" });

      UserService.getUsersByIds([mockUserId], "name");
      expect(UserRepository.findUsersByIds).toHaveBeenCalledWith(
        [mockUserId],
        "name",
      );

      UserService.findCourierById(mockUserId);
      expect(UserRepository.findCourierById).toHaveBeenCalledWith(mockUserId);

      UserService.getAuthUser(mockUserId);
      expect(UserRepository.findUserForAuth).toHaveBeenCalledWith(mockUserId);
    });
  });
});
