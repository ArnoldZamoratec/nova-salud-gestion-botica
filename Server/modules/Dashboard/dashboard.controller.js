import { DashboardService } from "./dashboard.service.js";
import { InternalServerError } from "../../utils/errors.js";

export const GetDashboardStatsController = async (req, res, next) => {
  try {
    const stats = await DashboardService.getDashboardStats();
    res.status(200).json({
      message: "Estadísticas del panel obtenidas correctamente",
      stats,
    });
  } catch (error) {
    next(
      new InternalServerError(
        "No se pudieron obtener las estadísticas del panel: " + error.message,
      ),
    );
  }
};

export const GetRevenueForecastController = async (req, res, next) => {
  try {
    const result = await DashboardService.getRevenueForecast();
    res.status(200).json({
      message: "Pronóstico de ingresos generado correctamente",
      ...result,
    });
  } catch (error) {
    next(
      new InternalServerError(
        "No se pudo generar el pronóstico de ingresos: " + error.message,
      ),
    );
  }
};

export const GetCustomerSegmentsController = async (req, res, next) => {
  try {
    const result = await DashboardService.getCustomerSegments();

    if (result.clusters.length === 0) {
      return res.status(200).json({
        message:
          "Datos de clientes insuficientes para segmentar (se requieren al menos 3 clientes activos)",
        clusters: [],
        userAssignments: [],
      });
    }

    res.status(200).json({
      message: "Segmentación de clientes completada correctamente",
      clusters: result.clusters,
      userAssignments: result.userAssignments,
    });
  } catch (error) {
    next(
      new InternalServerError("No se pudo segmentar a los clientes: " + error.message),
    );
  }
};

export const GetProductBundlesController = async (req, res, next) => {
  try {
    const rules = await DashboardService.getProductBundles();

    if (rules.length === 0) {
      return res.status(200).json({
        message: "No se encontraron reglas de asociación de productos relevantes.",
        rules: [],
      });
    }

    res.status(200).json({
      message: "Combos / reglas de asociación de productos obtenidos correctamente",
      rules,
    });
  } catch (error) {
    next(
      new InternalServerError(
        "No se pudieron obtener los combos de productos: " + error.message,
      ),
    );
  }
};

export const GetInventoryVelocityController = async (req, res, next) => {
  try {
    const products = await DashboardService.getInventoryVelocity();
    res.status(200).json({
      message: "Análisis de rotación de inventario completado correctamente",
      products,
    });
  } catch (error) {
    next(
      new InternalServerError(
        "No se pudo analizar la rotación de inventario: " + error.message,
      ),
    );
  }
};
