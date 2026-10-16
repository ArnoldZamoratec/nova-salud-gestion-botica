import { NotificationRepository } from "./notification.repository.js";
import { NotFoundError, ForbiddenError } from "../../utils/errors.js";
import { DEFAULT_MIN_STOCK } from "../../utils/constants.js";

const getTargetRoles = (userRole) => {
  const targetRoles = [userRole, "all"];
  if (userRole === "super_admin") {
    targetRoles.push("admin");
  }
  return targetRoles;
};

export const NotificationService = {
  getUserNotifications: async (userId, userRole, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const targetRoles = getTargetRoles(userRole);

    const query = {
      $or: [{ recipient: userId }, { recipientRole: { $in: targetRoles } }],
    };

    const [notifications, total] = await Promise.all([
      NotificationRepository.findPaginated(query, skip, limit),
      NotificationRepository.countDocuments(query),
    ]);

    const formattedNotifications = notifications.map((notif) => {
      const isRead = notif.recipient
        ? notif.isRead
        : notif.readBy &&
          notif.readBy.some((id) => id.toString() === userId.toString());

      return {
        ...notif,
        isRead: !!isRead,
        readBy: undefined,
      };
    });

    return {
      notifications: formattedNotifications,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  },

  markAsRead: async (notificationId, userId, userRole) => {
    const notification = await NotificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundError("Notificación no encontrada");
    }

    const targetRoles = getTargetRoles(userRole);

    const isRecipient =
      notification.recipient &&
      notification.recipient.toString() === userId.toString();
    const isTargetRole = targetRoles.includes(notification.recipientRole);

    if (!isRecipient && !isTargetRole) {
      throw new ForbiddenError(
        "No tienes permiso para acceder a esta notificación",
      );
    }

    if (notification.recipient) {
      notification.isRead = true;
    } else {
      if (
        !notification.readBy.some((id) => id.toString() === userId.toString())
      ) {
        notification.readBy.push(userId);
      }
    }

    await NotificationRepository.saveNotification(notification);

    return {
      ...notification.toObject(),
      isRead: true,
      readBy: undefined,
    };
  },

  markAllAsRead: async (userId, userRole) => {
    await NotificationRepository.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } },
    );

    const targetRoles = getTargetRoles(userRole);

    await NotificationRepository.updateMany(
      {
        recipient: null,
        recipientRole: { $in: targetRoles },
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } },
    );
  },

  getUnreadCount: async (userId, userRole) => {
    const targetRoles = getTargetRoles(userRole);

    const query = {
      $or: [
        { recipient: userId, isRead: false },
        {
          recipient: null,
          recipientRole: { $in: targetRoles },
          readBy: { $ne: userId },
        },
      ],
    };

    return await NotificationRepository.countDocuments(query);
  },

  createNotification: async (notificationData) => {
    try {
      const {
        title,
        message,
        type = "general",
        recipient = null,
        recipientRole = "all",
        metadata = null,
      } = notificationData;

      return await NotificationRepository.createNotification({
        title,
        message,
        type,
        recipient,
        recipientRole,
        metadata,
      });
    } catch (error) {
      console.error("Error en el servicio createNotification:", error);
      throw error;
    }
  },

  checkAndNotifyLowStock: async (product) => {
    try {
      const stockMinimo = product.min_stock ?? DEFAULT_MIN_STOCK;
      if (product.stock <= stockMinimo) {
        const existingNotification =
          await NotificationRepository.findExistingLowStockAlert(
            product._id,
            product.stock,
          );

        if (!existingNotification) {
          await NotificationService.createNotification({
            title: "Alerta de stock bajo ⚠️",
            message: `¡El producto "${product.name}" tiene stock bajo! Solo quedan ${product.stock} unidades (mínimo: ${stockMinimo}). Programe la reposición.`,
            type: "low_stock",
            recipient: null,
            recipientRole: "admin",
            metadata: {
              productId: product._id,
              productName: product.name,
              stock: product.stock,
            },
          });
        }
      }
    } catch (error) {
      console.error(
        `Error al verificar stock bajo del producto ${product._id}:`,
        error,
      );
    }
  },
};
