import { Boxes } from "lucide-react";

export default function InventoryTab({ products }) {
  const getBadgeStyles = (status) => {
    switch (status) {
      case "Reponer de inmediato":
        return "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200";
      case "Advertencia":
        return "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200";
      case "Saludable":
        return "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200";
      case "Agotado":
        return "bg-red-150 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-850 text-gray-700 dark:text-gray-400 border-gray-200";
    }
  };

  return (
    <div className="bg-(--color-surface-card) dark:bg-(--color-panel-dark) border border-(--color-border-base) dark:border-gray-800 rounded-xl p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-(--color-text-primary) dark:text-white flex items-center gap-2">
          <Boxes className="w-5 h-5 text-(--color-primary-700)" />
          Análisis de agotamiento de inventario y pronóstico de demanda
        </h3>
        <p className="text-xs text-(--color-text-secondary)">
          Calcula la velocidad de venta (unidades promedio vendidas por día en los últimos 30 días) y estima los días que faltan para agotar el stock
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-(--color-surface-page) dark:bg-[#2c2c2c] text-(--color-text-secondary) dark:text-gray-400 font-semibold border-b border-(--color-border-base) dark:border-gray-800">
            <tr>
              <th className="p-3 pl-4">Nombre del producto</th>
              <th className="p-3">Stock actual</th>
              <th className="p-3">Vendidos (últimos 30 días)</th>
              <th className="p-3">Ventas diarias</th>
              <th className="p-3">Días restantes (est.)</th>
              <th className="p-3 pr-4 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border-base) dark:divide-gray-800 text-(--color-text-body) dark:text-gray-300">
            {products.map((prod) => (
              <tr
                key={prod.productId}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-850/10"
              >
                <td className="p-3 pl-4 font-semibold text-(--color-text-primary) dark:text-white max-w-[280px] truncate">
                  {prod.name}
                </td>
                <td className="p-3 font-medium">{prod.stock} unid.</td>
                <td className="p-3">{prod.unitsSoldLast30Days} unid.</td>
                <td className="p-3 text-xs">{prod.dailyVelocity} unid./día</td>
                <td className="p-3">
                  {prod.daysRemaining === Infinity ? (
                    <span className="text-(--color-text-muted) italic">
                      Sin ventas
                    </span>
                  ) : (
                    <span
                      className={
                        prod.daysRemaining <= 7
                          ? "text-(--color-danger-500) font-bold"
                          : "font-semibold"
                      }
                    >
                      {prod.daysRemaining} días
                    </span>
                  )}
                </td>
                <td className="p-3 pr-4 text-right">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyles(prod.status)}`}
                  >
                    {prod.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
