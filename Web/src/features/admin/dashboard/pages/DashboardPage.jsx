import { useState } from "react";
import { LayoutDashboard, Brain, Boxes } from "lucide-react";
import {
  useGetDashboardStatsQuery,
  useGetRevenueForecastQuery,
  useGetCustomerSegmentsQuery,
  useGetProductBundlesQuery,
  useGetInventoryAnalysisQuery,
} from "../api/dashboardApi";
import OverviewTab from "../components/OverviewTab";
import AITab from "../components/AITab";
import InventoryTab from "../components/InventoryTab";
import GlobalLoader from "../../../../components/ui/GlobalLoader";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Obtiene todos los datos del panel
  const { data: statsData, isLoading: statsLoading } =
    useGetDashboardStatsQuery();
  const { data: forecastData, isLoading: forecastLoading } =
    useGetRevenueForecastQuery();
  const { data: segmentsData, isLoading: segmentsLoading } =
    useGetCustomerSegmentsQuery();
  const { data: bundlesData, isLoading: bundlesLoading } =
    useGetProductBundlesQuery();
  const { data: inventoryData, isLoading: inventoryLoading } =
    useGetInventoryAnalysisQuery();

  const isAnyLoading =
    statsLoading ||
    forecastLoading ||
    segmentsLoading ||
    bundlesLoading ||
    inventoryLoading;

  if (isAnyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <GlobalLoader width="w-10" height="h-10" text="text-(--color-primary-600)" />
        <p className="text-(--color-text-secondary) dark:text-gray-400 font-medium text-sm">
          Ejecutando algoritmos de analítica y cargando el panel...
        </p>
      </div>
    );
  }

  const stats = statsData?.stats || {};
  const historical = forecastData?.historical || [];
  const forecast = forecastData?.forecast || [];
  const trend = forecastData?.trend || {};
  const clusters = segmentsData?.clusters || [];
  const userAssignments = segmentsData?.userAssignments || [];
  const bundles = bundlesData?.rules || [];
  const inventoryProducts = inventoryData?.products || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Encabezado superior */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-(--color-text-primary) dark:text-white tracking-tight">
            Resumen del panel
          </h1>
          <p className="text-(--color-text-secondary) dark:text-gray-400 mt-1">
            Analítica del negocio en tiempo real e información con IA
          </p>
        </div>

        {/* Botones de pestañas */}
        <div className="flex bg-(--color-surface-muted) dark:bg-(--color-panel-dark) p-1 rounded-xl border border-(--color-border-base) dark:border-gray-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-(--color-surface-card) dark:bg-[#2c2c2c] text-(--color-primary-700) dark:text-green-400 shadow-sm"
                : "text-(--color-text-secondary) dark:text-gray-400 hover:text-(--color-text-primary) dark:hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Resumen
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "ai"
                ? "bg-(--color-surface-card) dark:bg-[#2c2c2c] text-(--color-primary-700) dark:text-green-400 shadow-sm"
                : "text-(--color-text-secondary) dark:text-gray-400 hover:text-(--color-text-primary) dark:hover:text-white"
            }`}
          >
            <Brain className="w-4 h-4" />
            Información con IA
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "inventory"
                ? "bg-(--color-surface-card) dark:bg-[#2c2c2c] text-(--color-primary-700) dark:text-green-400 shadow-sm"
                : "text-(--color-text-secondary) dark:text-gray-400 hover:text-(--color-text-primary) dark:hover:text-white"
            }`}
          >
            <Boxes className="w-4 h-4" />
            Rotación de inventario
          </button>
        </div>
      </div>

      {/* Vistas de las pestañas */}
      {activeTab === "overview" && (
        <OverviewTab
          stats={stats}
          historical={historical}
          forecast={forecast}
          trend={trend}
        />
      )}

      {activeTab === "ai" && (
        <AITab
          clusters={clusters}
          userAssignments={userAssignments}
          bundles={bundles}
        />
      )}

      {activeTab === "inventory" && (
        <InventoryTab products={inventoryProducts} />
      )}
    </div>
  );
}
