import { OrderService } from "./order.service.js";

export const CreateOrderController = async (req, res, next) => {
  try {
    const { items, address, paymentMethod = "COD" } = req.body;
    const userId = req.user._id;

    const result = await OrderService.createOrder(
      userId,
      items,
      address,
      paymentMethod,
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const GetUserOrdersController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await OrderService.getUserOrders(userId);

    res.status(200).json({
      message: "Pedidos del usuario obtenidos correctamente",
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const CancelOrderController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await OrderService.cancelOrder(id, userId);

    res.status(200).json({
      message: "Pedido cancelado y eliminado",
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const GetAllOrdersAdminController = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      minTotal: req.query.minTotal,
      maxTotal: req.query.maxTotal,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
    };

    const pagination = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
    };

    const result = await OrderService.getAllOrdersAdmin(filters, pagination);

    res.status(200).json({
      message: "Pedidos obtenidos correctamente (administrador)",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const GetOrderByIdAdminController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderByIdAdmin(id);

    res.status(200).json({
      message: "Pedido obtenido correctamente (administrador)",
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const UpdateOrderStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const order = await OrderService.updateOrderStatus(
      id,
      status,
      userId,
      userRole,
    );

    res.status(200).json({
      message: "Estado del pedido actualizado correctamente",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const PaymobWebhookController = async (req, res, next) => {
  try {
    const { hmac } = req.query;
    const { obj } = req.body;

    await OrderService.handlePaymobWebhook(hmac, obj);

    res.status(200).json({ message: "Webhook procesado correctamente" });
  } catch (error) {
    console.error("Error en webhook de Paymob:", error.message);
    next(error);
  }
};

export const AssignOrderToCourierController = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const { courierId } = req.body;

    const order = await OrderService.assignOrderToCourier(orderId, courierId);

    res.status(200).json({
      message: "Pedido asignado al repartidor correctamente",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const GetCourierOrdersController = async (req, res, next) => {
  try {
    const courierId = req.user._id;
    const { status } = req.query;

    const orders = await OrderService.getCourierOrders(courierId, status);

    res.status(200).json({
      message: "Pedidos del repartidor obtenidos correctamente",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const DeleteOrderAdminController = async (req, res, next) => {
  try {
    const { id } = req.params;

    await OrderService.deleteOrderAdmin(id);

    res.status(200).json({
      message: "Pedido eliminado correctamente y stock restaurado",
    });
  } catch (error) {
    next(error);
  }
};
