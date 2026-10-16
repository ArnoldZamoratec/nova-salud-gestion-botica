/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
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
 *     Cart:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         user:
 *           type: string
 *           example: 68cafda1898ebb5b4cb77b88
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         total_price:
 *           type: number
 *           example: 76
 *         is_deleted:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-09-21T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-09-21T00:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   - name: Carrito
 *     description: Gestión del carrito
 */

/**
 * @swagger
 * /api/cart/get-user-cart:
 *   get:
 *     summary: Obtener el carrito del usuario autenticado
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalle del carrito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Carrito no encontrado
 */

/**
 * @swagger
 * /api/cart/add-to-cart:
 *   post:
 *     summary: Agregar un producto al carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - quantity
 *               - price
 *             properties:
 *               product:
 *                 type: string
 *                 example: 68cafda1898ebb5b4cb77b88
 *               quantity:
 *                 type: number
 *                 example: 2
 *               price:
 *                 type: number
 *                 example: 38
 *     responses:
 *       200:
 *         description: Producto agregado al carrito
 *       400:
 *         description: Solicitud incorrecta
 */

/**
 * @swagger
 * /api/cart/:productId:
 *   patch:
 *     summary: Actualizar la cantidad de un producto en el carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 *       400:
 *         description: Solicitud incorrecta
 *
 *   delete:
 *     summary: Quitar un producto del carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 *       400:
 *         description: Solicitud incorrecta
 */

/**
 * @swagger
 * /api/cart/clear-cart:
 *   delete:
 *     summary: Vaciar el carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado
 *       400:
 *         description: Solicitud incorrecta
 */
