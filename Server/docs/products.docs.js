/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - stock
 *         - image
 *       properties:
 *         name:
 *           type: string
 *           example: Cataflam
 *         description:
 *           type: string
 *           example: Cataflam contiene diclofenaco potásico, usado para tratar el dolor.
 *         price:
 *           type: number
 *           example: 38
 *         category:
 *           type: string
 *           example: 68cafda1898ebb5b4cb77b88
 *         stock:
 *           type: number
 *           example: 20
 *         has_strips:
 *           type: boolean
 *           example: false
 *         strip_count:
 *           type: number
 *           example: 0
 *         requires_prescription:
 *           type: boolean
 *           example: false
 *         image:
 *           type: string
 *           format: binary
 *         top_selling :
 *           type: boolean
 *           example: false
 *         rating:
 *           type: number
 *           example: 4
 *         is_deleted:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * tags:
 *   - name: Productos
 *     description: Gestión de productos
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto (solo administrador)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *       400:
 *         description: Solicitud incorrecta
 *
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Detalle del producto
 *       404:
 *         description: Producto no encontrado
 *
 *   patch:
 *     summary: Actualizar un producto por ID (solo administrador)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nombre de producto actualizado
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               has_strips:
 *                 type: boolean
 *               strip_count:
 *                 type: number
 *               requires_prescription:
 *                 type: boolean
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: Solicitud incorrecta
 *
 *   delete:
 *     summary: Eliminar un producto por ID (solo administrador)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 */
