import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "./notification.service.js";
import { NotificationRepository } from "./notification.repository.js";
import { NotFoundError, ForbiddenError } from "../../utils/errors.js";

vi.mock("./notification.repository.js");

describe("NotificationService", () => {
  const mockUserId = "user123";
  const mockAdminId = "admin123";
  const mockNotificationId = "notif123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserNotifications", () => {
    it("obtiene, formatea y pagina las notificaciones dirigidas", async () => {
      const mockList = [
        { _id: "1", recipient: mockUserId, isRead: true, title: "Test 1" },
        { _id: "2", recipient: mockUserId, isRead: false, title: "Test 2" },
      ];
      NotificationRepository.findPaginated.mockResolvedValue(mockList);
      NotificationRepository.countDocuments.mockResolvedValue(15);

      const result = await NotificationService.getUserNotifications(
        mockUserId,
        "user",
        1,
        10,
      );

      expect(NotificationRepository.findPaginated).toHaveBeenCalledWith(
        {
          $or: [
            { recipient: mockUserId },
            { recipientRole: { $in: ["user", "all"] } },
          ],
        },
        0,
        10,
      );
      expect(result.notifications).toHaveLength(2);
      expect(result.notifications[0].isRead).toBe(true);
      expect(result.notifications[1].isRead).toBe(false);
      expect(result.pagination).toEqual({
        totalItems: 15,
        totalPages: 2,
        currentPage: 1,
        limit: 10,
      });
    });

    it("formatea notificaciones generales revisando readBy para super_admin", async () => {
      const mockList = [
        {
          _id: "1",
          recipient: null,
          recipientRole: "admin",
          readBy: [mockAdminId],
          title: "Alert",
        },
        {
          _id: "2",
          recipient: null,
          recipientRole: "all",
          readBy: [],
          title: "General",
        },
      ];
      NotificationRepository.findPaginated.mockResolvedValue(mockList);
      NotificationRepository.countDocuments.mockResolvedValue(2);

      const result = await NotificationService.getUserNotifications(
        mockAdminId,
        "super_admin",
        1,
        10,
      );

      expect(NotificationRepository.findPaginated).toHaveBeenCalledWith(
        {
          $or: [
            { recipient: mockAdminId },
            { recipientRole: { $in: ["super_admin", "all", "admin"] } },
          ],
        },
        0,
        10,
      );
      expect(result.notifications[0].isRead).toBe(true);
      expect(result.notifications[0].readBy).toBeUndefined();
      expect(result.notifications[1].isRead).toBe(false);
    });
  });

  describe("markAsRead", () => {
    it("lanza NotFoundError si la notificación no existe", async () => {
      NotificationRepository.findById.mockResolvedValue(null);

      await expect(
        NotificationService.markAsRead(mockNotificationId, mockUserId, "user"),
      ).rejects.toThrow(NotFoundError);
    });

    it("lanza ForbiddenError si el usuario no es destinatario ni tiene el rol objetivo", async () => {
      const mockNotif = {
        _id: mockNotificationId,
        recipient: "anotherUser",
        recipientRole: "admin",
      };
      NotificationRepository.findById.mockResolvedValue(mockNotif);

      await expect(
        NotificationService.markAsRead(mockNotificationId, mockUserId, "user"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("marca como leída la notificación dirigida y guarda", async () => {
      const mockNotif = {
        _id: mockNotificationId,
        recipient: mockUserId,
        isRead: false,
        toObject: function () {
          return { ...this };
        },
      };
      NotificationRepository.findById.mockResolvedValue(mockNotif);

      const result = await NotificationService.markAsRead(
        mockNotificationId,
        mockUserId,
        "user",
      );

      expect(mockNotif.isRead).toBe(true);
      expect(NotificationRepository.saveNotification).toHaveBeenCalledWith(
        mockNotif,
      );
      expect(result.isRead).toBe(true);
    });

    it("agrega el userId a readBy en notificaciones generales si aún no está", async () => {
      const mockNotif = {
        _id: mockNotificationId,
        recipient: null,
        recipientRole: "all",
        readBy: [],
        toObject: function () {
          return { ...this };
        },
      };
      NotificationRepository.findById.mockResolvedValue(mockNotif);

      const result = await NotificationService.markAsRead(
        mockNotificationId,
        mockUserId,
        "user",
      );

      expect(mockNotif.readBy).toContain(mockUserId);
      expect(NotificationRepository.saveNotification).toHaveBeenCalledWith(
        mockNotif,
      );
      expect(result.isRead).toBe(true);
      expect(result.readBy).toBeUndefined();
    });
  });

  describe("markAllAsRead", () => {
    it("actualiza las notificaciones dirigidas y por rol con los filtros correctos", async () => {
      await NotificationService.markAllAsRead(mockAdminId, "super_admin");

      expect(NotificationRepository.updateMany).toHaveBeenNthCalledWith(
        1,
        { recipient: mockAdminId, isRead: false },
        { $set: { isRead: true } },
      );
      expect(NotificationRepository.updateMany).toHaveBeenNthCalledWith(
        2,
        {
          recipient: null,
          recipientRole: { $in: ["super_admin", "all", "admin"] },
          readBy: { $ne: mockAdminId },
        },
        { $addToSet: { readBy: mockAdminId } },
      );
    });
  });

  describe("getUnreadCount", () => {
    it("cuenta las notificaciones no leídas según userId y roles", async () => {
      NotificationRepository.countDocuments.mockResolvedValue(4);

      const count = await NotificationService.getUnreadCount(
        mockUserId,
        "user",
      );

      expect(NotificationRepository.countDocuments).toHaveBeenCalledWith({
        $or: [
          { recipient: mockUserId, isRead: false },
          {
            recipient: null,
            recipientRole: { $in: ["user", "all"] },
            readBy: { $ne: mockUserId },
          },
        ],
      });
      expect(count).toBe(4);
    });
  });

  describe("createNotification", () => {
    it("llama al repositorio con los valores enviados y por defecto", async () => {
      const input = {
        title: "New Alert",
        message: "Stock is low",
      };
      NotificationRepository.createNotification.mockResolvedValue({
        _id: "notif1",
        ...input,
      });

      const result = await NotificationService.createNotification(input);

      expect(NotificationRepository.createNotification).toHaveBeenCalledWith({
        title: "New Alert",
        message: "Stock is low",
        type: "general",
        recipient: null,
        recipientRole: "all",
        metadata: null,
      });
      expect(result._id).toBe("notif1");
    });

    it("vuelve a lanzar el error si falla el repositorio", async () => {
      NotificationRepository.createNotification.mockRejectedValue(
        new Error("DB Error"),
      );

      await expect(
        NotificationService.createNotification({
          title: "Fail",
          message: "Fail",
        }),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("checkAndNotifyLowStock", () => {
    it("crea la alerta de stock bajo cuando el stock es <= stock mínimo y no existe alerta previa", async () => {
      const product = { _id: "prod123", name: "Panadol", stock: 3, min_stock: 5 };
      NotificationRepository.findExistingLowStockAlert.mockResolvedValue(null);

      await NotificationService.checkAndNotifyLowStock(product);

      expect(
        NotificationRepository.findExistingLowStockAlert,
      ).toHaveBeenCalledWith("prod123", 3);
      expect(NotificationRepository.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Alerta de stock bajo ⚠️",
          type: "low_stock",
          recipientRole: "admin",
          metadata: {
            productId: "prod123",
            productName: "Panadol",
            stock: 3,
          },
        }),
      );
    });

    it("no crea la alerta si el stock es mayor al stock mínimo", async () => {
      const product = { _id: "prod123", name: "Panadol", stock: 6, min_stock: 5 };

      await NotificationService.checkAndNotifyLowStock(product);

      expect(
        NotificationRepository.findExistingLowStockAlert,
      ).not.toHaveBeenCalled();
      expect(NotificationRepository.createNotification).not.toHaveBeenCalled();
    });

    it("no crea la alerta si ya existe una activa", async () => {
      const product = { _id: "prod123", name: "Panadol", stock: 2 };
      NotificationRepository.findExistingLowStockAlert.mockResolvedValue({
        _id: "existingAlert",
      });

      await NotificationService.checkAndNotifyLowStock(product);

      expect(NotificationRepository.createNotification).not.toHaveBeenCalled();
    });
  });
});
