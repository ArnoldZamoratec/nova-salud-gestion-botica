/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - product
 *         - quantity
 *         - price
 *       properties:
 *         product:
 *           type: string
 *           example: 68cafda1898ebb5b4cb77b88
 *         quantity:
 *           type: number
 *           example: 2
 *         price:
 *           type: number
 *           example: 38
 *     Order:
 *       type: object
 *       required:
 *         - user
 *         - items
 *         - total
 *         - address
 *       properties:
 *         user:
 *           type: string
 *           example: 68cafda1898ebb5b4cb77b88
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         total:
 *           type: number
 *           example: 76
 *         status:
 *           type: string
 *           enum: [pending, shipped, delivered, canceled]
 *           example: pending
 *         address:
 *           type: string
 *           example: Av. Larco 123, Miraflores, Lima
 *         is_deleted:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * tags:
 *   - name: Pedidos
 *     description: Gestión de pedidos
 */

/**
 * @swagger
 * /api/order/create-order:
 *   post:
 *     summary: Crear un nuevo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - total
 *               - address
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               total:
 *                 type: number
 *                 example: 76
 *               address:
 *                 type: string
 *                 example: Av. Larco 123, Miraflores, Lima
 *     responses:
 *       201:
 *         description: Pedido creado correctamente
 *       400:
 *         description: Solicitud incorrecta
 */

/**
 * @swagger
 * /api/order/:
 *   get:
 *     summary: Listar los pedidos del usuario autenticado
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/order/{id}/cancel:
 *   patch:
 *     summary: Cancelar un pedido existente
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido a cancelar
 *     responses:
 *       200:
 *         description: Pedido cancelado correctamente
 *       400:
 *         description: Solicitud incorrecta (p. ej. ya cancelado o no permitido)
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Pedido no encontrado
 */