import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoryService } from "./category.service.js";
import { CategoryRepository } from "./category.repository.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../utils/errors.js";
import cloudinary from "../../config/cloudinary.js";

vi.mock("./category.repository.js");
vi.mock("../../config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}));

describe("CategoryService", () => {
  const mockFile = { buffer: Buffer.from("test-buffer") };
  const mockCategory = {
    _id: "cat123",
    name: "Test Category",
    slug: "test-category",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cloudinary.uploader.upload_stream.mockImplementation((options, cb) => {
      cb(null, { secure_url: "https://cloudinary.com/test.webp" });
      return { end: vi.fn() };
    });
  });

  describe("createCategory", () => {
    it("lanza BadRequestError si falta el nombre", async () => {
      await expect(
        CategoryService.createCategory(null, "description", mockFile),
      ).rejects.toThrow(BadRequestError);
    });

    it("lanza BadRequestError si falta el archivo", async () => {
      await expect(
        CategoryService.createCategory("Test Category", "description", null),
      ).rejects.toThrow(BadRequestError);
    });

    it("lanza ConflictError si la categoría ya existe", async () => {
      CategoryRepository.findByName.mockResolvedValue(mockCategory);
      await expect(
        CategoryService.createCategory(
          "Test Category",
          "description",
          mockFile,
        ),
      ).rejects.toThrow(ConflictError);
    });

    it("lanza error si falla la subida a Cloudinary", async () => {
      CategoryRepository.findByName.mockResolvedValue(null);
      cloudinary.uploader.upload_stream.mockImplementation((options, cb) => {
        cb(new Error("Cloudinary error"), null);
        return { end: vi.fn() };
      });

      await expect(
        CategoryService.createCategory(
          "Test Category",
          "description",
          mockFile,
        ),
      ).rejects.toThrow("Cloudinary error");
    });

    it("crea la categoría y la devuelve", async () => {
      CategoryRepository.findByName.mockResolvedValue(null);
      CategoryRepository.createCategory.mockResolvedValue(mockCategory);

      const result = await CategoryService.createCategory(
        "Test Category",
        "description",
        mockFile,
      );

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({ folder: "categories", format: "webp" }),
        expect.any(Function),
      );
      expect(CategoryRepository.createCategory).toHaveBeenCalledWith({
        name: "Test Category",
        description: "description",
        image: "https://cloudinary.com/test.webp",
        slug: "test-category",
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe("getAllCategories", () => {
    it("devuelve categorías paginadas sin búsqueda", async () => {
      CategoryRepository.findAllPaginated.mockResolvedValue({
        totalItems: 20,
        categories: [mockCategory],
      });

      const result = await CategoryService.getAllCategories(null, 2, 5);

      expect(CategoryRepository.findAllPaginated).toHaveBeenCalledWith(
        { is_active: true, is_deleted: false },
        5,
        5,
      );
      expect(result.pagination).toEqual({
        totalItems: 20,
        totalPages: 4,
        currentPage: 2,
        limit: 5,
      });
      expect(result.categories).toEqual([mockCategory]);
    });

    it("devuelve categorías paginadas con filtro de búsqueda", async () => {
      CategoryRepository.findAllPaginated.mockResolvedValue({
        totalItems: 1,
        categories: [mockCategory],
      });

      await CategoryService.getAllCategories("keyword", 1, 10);

      expect(CategoryRepository.findAllPaginated).toHaveBeenCalledWith(
        {
          is_active: true,
          is_deleted: false,
          $or: [
            { name: { $regex: "keyword", $options: "i" } },
            { description: { $regex: "keyword", $options: "i" } },
          ],
        },
        0,
        10,
      );
    });
  });

  describe("getCategoryById", () => {
    it("lanza NotFoundError si no se encuentra la categoría", async () => {
      CategoryRepository.findById.mockResolvedValue(null);
      await expect(CategoryService.getCategoryById("123")).rejects.toThrow(
        NotFoundError,
      );
    });

    it("devuelve la categoría si existe", async () => {
      CategoryRepository.findById.mockResolvedValue(mockCategory);
      const result = await CategoryService.getCategoryById("123");
      expect(result).toEqual(mockCategory);
    });
  });

  describe("getCategoryBySlug", () => {
    it("lanza NotFoundError si no se encuentra la categoría", async () => {
      CategoryRepository.findBySlug.mockResolvedValue(null);
      await expect(
        CategoryService.getCategoryBySlug("slug-test"),
      ).rejects.toThrow(NotFoundError);
    });

    it("devuelve la categoría si existe", async () => {
      CategoryRepository.findBySlug.mockResolvedValue(mockCategory);
      const result = await CategoryService.getCategoryBySlug("slug-test");
      expect(result).toEqual(mockCategory);
    });
  });

  describe("getCategoryByNameOrSlug", () => {
    it("devuelve la categoría desde el repositorio", async () => {
      CategoryRepository.findByNameOrSlug.mockResolvedValue(mockCategory);
      const result =
        await CategoryService.getCategoryByNameOrSlug("identifier");
      expect(CategoryRepository.findByNameOrSlug).toHaveBeenCalledWith(
        "identifier",
      );
      expect(result).toEqual(mockCategory);
    });
  });

  describe("deleteCategory", () => {
    it("lanza NotFoundError si no se encuentra la categoría", async () => {
      CategoryRepository.softDelete.mockResolvedValue(null);
      await expect(CategoryService.deleteCategory("123")).rejects.toThrow(
        NotFoundError,
      );
    });

    it("elimina y devuelve la categoría", async () => {
      CategoryRepository.softDelete.mockResolvedValue(mockCategory);
      const result = await CategoryService.deleteCategory("123");
      expect(result).toEqual(mockCategory);
    });
  });

  describe("updateCategory", () => {
    it("lanza NotFoundError si la categoría no existe", async () => {
      CategoryRepository.findById.mockResolvedValue(null);
      await expect(
        CategoryService.updateCategory("123", { name: "New Name" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("lanza BadRequestError si no se envían datos ni archivo", async () => {
      CategoryRepository.findById.mockResolvedValue(mockCategory);
      await expect(
        CategoryService.updateCategory("123", {}, null),
      ).rejects.toThrow(BadRequestError);
      await expect(
        CategoryService.updateCategory("123", null, null),
      ).rejects.toThrow(BadRequestError);
    });

    it("lanza BadRequestError si no hay campos válidos para actualizar", async () => {
      CategoryRepository.findById.mockResolvedValue(mockCategory);
      await expect(
        CategoryService.updateCategory("123", { invalidField: "test" }, null),
      ).rejects.toThrow(BadRequestError);
    });

    it("actualiza el nombre, genera un nuevo slug, sube la imagen y filtra campos inválidos", async () => {
      CategoryRepository.findById.mockResolvedValue(mockCategory);
      CategoryRepository.updateById.mockResolvedValue({
        ...mockCategory,
        name: "New Name",
        slug: "new-name",
      });

      const result = await CategoryService.updateCategory(
        "123",
        { name: "New Name", invalidField: "drop" },
        mockFile,
      );

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(CategoryRepository.updateById).toHaveBeenCalledWith("123", {
        name: "New Name",
        slug: "new-name",
        image: "https://cloudinary.com/test.webp",
      });
      expect(result.name).toBe("New Name");
    });

    it("actualiza solo la descripción sin nueva imagen", async () => {
      CategoryRepository.findById.mockResolvedValue(mockCategory);
      CategoryRepository.updateById.mockResolvedValue({
        ...mockCategory,
        description: "New Desc",
      });

      await CategoryService.updateCategory(
        "123",
        { description: "New Desc" },
        null,
      );

      expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
      expect(CategoryRepository.updateById).toHaveBeenCalledWith("123", {
        description: "New Desc",
      });
    });
  });
});
