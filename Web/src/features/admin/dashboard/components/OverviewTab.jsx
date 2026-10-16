import {
  Coins,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
} from "lucide-react";
import StatsCard from "../../components/StatsCard";
import RevenueChart from "./RevenueChart";

export default function OverviewTab({ stats, historical, forecast, trend }) {
  return (
    <div className="space-y-6">
      {/* Cuadrícula de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Ingresos totales"
          value={`S/ ${stats.totalRevenue?.toLocaleString("es-PE")}`}
          icon={Coins}
          color="brand"
        />
        <StatsCard
          title="Pedidos totales"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="brand"
        />
        <StatsCard
          title="Productos totales"
          value={stats.totalProducts}
          icon={Package}
          color="brand"
        />
        <StatsCard
          title="Clientes totales"
          value={stats.totalUsers}
          icon={Users}
          color="brand"
        />
      </div>

      {/* Barra de alertas rápidas */}
      {(stats.lowStockCount > 0 || stats.pendingOrdersCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.lowStockCount > 0 && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  Alerta de stock bajo:
                </span>{" "}
                <span className="text-sm text-amber-700 dark:text-amber-400">
                  {stats.lowStockCount} productos están en o por debajo de su stock mínimo. Revisa la pestaña Inventario.
                </span>
              </div>
            </div>
          )}
          {stats.pendingOrdersCount > 0 && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Pedidos pendientes:
                </span>{" "}
                <span className="text-sm text-emerald-700 dark:text-emerald-400">
                  {stats.pendingOrdersCount} pedidos están pendientes de atención.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gráfico de ingresos históricos y pronóstico IA */}
      <RevenueChart historical={historical} forecast={forecast} trend={trend} />
    </div>
  );
}
