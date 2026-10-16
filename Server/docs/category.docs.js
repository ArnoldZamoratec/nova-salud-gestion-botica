/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           example: Analgésicos
 *         description:
 *           type: string
 *           example: Medicamentos para aliviar el dolor
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
 *   - name: Categorías
 *     description: Gestión de categorías
 */

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: Crear una nueva categoría (solo administrador)
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Categoría creada correctamente
 *       400:
 *         description: Solicitud incorrecta
 *
 *   get:
 *     summary: Listar todas las categorías
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Detalle de la categoría
 *       404:
 *         description: Categoría no encontrada
 *
 *   patch:
 *     summary: Actualizar una categoría por ID (solo administrador)
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       400:
 *         description: Solicitud incorrecta
 *
 *   delete:
 *     summary: Eliminar una categoría por ID (solo administrador)
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       404:
 *         description: Categoría no encontrada
 */
