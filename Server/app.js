    import express from "express";
    import cors from "cors";
    import helmet from "helmet";
    import morgan from "morgan";
    import compression from "compression";
    import rateLimit from "express-rate-limit";
    import hpp from "hpp";
    import { corsOptions } from "./config/corsOptions.js";
    import globalErrorHandler from "./middleware/global_error_handler.middleware.js";
    import { ApiRouter } from "./routers/index.js";
    import { notFoundMiddleware } from "./middleware/not_found.middleware.js";
    import { sanitizeMiddleware } from "./middleware/sanitize.middleware.js";
    import { swaggerUi, swaggerSpec } from "./utils/swagger.js";
    import cookieParser from "cookie-parser";
    import path from "path";
    import { fileURLToPath } from "url";

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const app = express();


    app.set("trust proxy", 1);

    app.use(helmet());

    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    app.use(cors(corsOptions));
    app.use(compression());
    app.use(morgan("dev"));
    app.use(cookieParser());
    app.use(hpp());
    app.use(sanitizeMiddleware);

    // Sirve archivos estáticos desde la carpeta 'public'
    app.use(express.static(path.join(__dirname, "public")));

    // Límite global de solicitudes para todas las rutas de la API
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // máximo 100 solicitudes por IP en cada ventana
        standardHeaders: true,
        legacyHeaders: false,
        message: { status: "error", message: "Demasiadas solicitudes, inténtalo nuevamente más tarde" },
    });


    app.use("/api", limiter);


    // Verificación de estado
    app.get("/health", (req, res) => {
        res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
    });



    if (process.env.NODE_ENV !== "production") {
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }

    app.use("/api", ApiRouter);

    // 404
    app.use(notFoundMiddleware);

    // Manejador global de errores
    app.use(globalErrorHandler);

    export default app;