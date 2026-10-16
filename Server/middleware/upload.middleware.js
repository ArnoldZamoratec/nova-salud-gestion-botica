import multer from "multer";
import sharp from "sharp";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Solo se permiten imágenes"));
        }
        cb(null, true);
    },
});


export const uploadSingle = (fieldName = "image") => upload.single(fieldName);

export const processImage = (options = {}) => async (req, res, next) => {
    if (!req.file) return next();

    const { width, height, quality = 80 } = options;

    // tamaño antes de procesar
    const beforeSize = req.file.buffer.length;
    console.log("Tamaño de imagen antes de procesar:", (beforeSize / 1024).toFixed(2), "KB");

    let sharpInstance = sharp(req.file.buffer);

    if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
            fit: "cover",
            withoutEnlargement: true,
        });
    }

    const processedBuffer = await sharpInstance.webp({ quality }).toBuffer();

    // tamaño después de procesar
    const afterSize = processedBuffer.length;
    console.log("Tamaño de imagen después de procesar:", (afterSize / 1024).toFixed(2), "KB");

    console.log("Ahorro por compresión:", ((beforeSize - afterSize) / 1024).toFixed(2), "KB");

    req.file.buffer = processedBuffer;
    req.file.mimetype = "image/webp";

    next();
};