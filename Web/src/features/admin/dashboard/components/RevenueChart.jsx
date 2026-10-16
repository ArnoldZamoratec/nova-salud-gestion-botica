import { TrendingUp } from "lucide-react";

export default function RevenueChart({
  historical = [],
  forecast = [],
  trend = {},
}) {
  // Configuración del gráfico SVG
  const combined = [
    ...historical.map((d, index) => ({
      val: d.revenue,
      label: d.date,
      type: "history",
      idx: index,
    })),
    ...forecast.map((d, index) => ({
      val: d.y,
      label: d.dateStr,
      type: "forecast",
      idx: index + historical.length,
    })),
  ];

  const maxRevenue = Math.max(...combined.map((c) => c.val), 100);
  const chartHeight = 240;
  const chartWidth = 900;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const points = combined.map((p, i) => {
    const x =
      paddingLeft +
      (i * (chartWidth - paddingLeft - paddingRight)) /
        (combined.length - 1 || 1);
    const y =
      chartHeight -
      paddingBottom -
      (p.val / maxRevenue) * (chartHeight - paddingTop - paddingBottom);
    return { ...p, x, y };
  });

  const historyPoints = points.filter((p) => p.type === "history");
  const forecastPoints = points.filter((p) => p.type === "forecast");

  // Crea los trazos
  let historyPath = "";
  if (historyPoints.length > 0) {
    historyPath =
      `M ${historyPoints[0].x} ${historyPoints[0].y} ` +
      historyPoints
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ");
  }

  let forecastPath = "";
  if (forecastPoints.length > 0 && historyPoints.length > 0) {
    const lastHistory = historyPoints[historyPoints.length - 1];
    forecastPath =
      `M ${lastHistory.x} ${lastHistory.y} ` +
      forecastPoints.map((p) => `L ${p.x} ${p.y}`).join(" ");
  }

  // Crea el relleno del degradado del historial
  let historyFillPath = "";
  if (historyPoints.length > 0) {
    const startX = historyPoints[0].x;
    const endX = historyPoints[historyPoints.length - 1].x;
    const baseY = chartHeight - paddingBottom;
    historyFillPath = `${historyPath} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
  }

  return (
    <div className="bg-(--color-surface-card) dark:bg-(--color-panel-dark) border border-(--color-border-base) dark:border-gray-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-(--color-text-primary) dark:text-white">
            Proyección de ingresos y tendencia histórica
          </h3>
          <p className="text-xs text-(--color-text-secondary)">
            Ventas reales de los últimos 30 días y pronóstico de los próximos 7 días por regresión lineal
          </p>
        </div>
        {trend.trendType && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full">
            <TrendingUp className="w-4 h-4 text-(--color-primary-600) dark:text-green-400" />
            <span className="text-xs font-bold text-(--color-primary-700) dark:text-green-400">
              {trend.trendType} (r = {trend.correlation})
            </span>
          </div>
        )}
      </div>

      {/* Gráfico de líneas SVG personalizado */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-[800px] select-none">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#165938" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#165938" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Líneas y etiquetas del eje Y */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const val = Math.round(maxRevenue * ratio);
              const y =
                chartHeight -
                paddingBottom -
                ratio * (chartHeight - paddingTop - paddingBottom);
              return (
                <g key={ratio}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-gray-100 dark:text-gray-800/60"
                    strokeWidth={1}
                    strokeDasharray={ratio !== 0 ? "4 4" : "0"}
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-(--color-text-muted) dark:fill-gray-500 font-semibold text-[10px]"
                  >
                    S/ {val.toLocaleString("es-PE")}
                  </text>
                </g>
              );
            })}

            {/* Áreas del gráfico */}
            {historyFillPath && (
              <path d={historyFillPath} fill="url(#chartGradient)" />
            )}

            {/* Línea del historial real */}
            {historyPath && (
              <path
                d={historyPath}
                fill="none"
                stroke="#165938"
                strokeWidth={3}
                strokeLinecap="round"
              />
            )}

            {/* Línea del pronóstico (punteada) */}
            {forecastPath && (
              <path
                d={forecastPath}
                fill="none"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray="5 5"
              />
            )}

            {/* Marcadores de puntos de datos */}
            {historyPoints
              .filter(
                (_, idx, arr) =>
                  idx === 0 || idx === arr.length - 1 || idx % 7 === 0,
              )
              .map((p) => (
                <circle
                  key={p.label}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  className="fill-white stroke-[#165938]"
                  strokeWidth={2.5}
                />
              ))}

            {forecastPoints.map((p) => (
              <circle
                key={p.label}
                cx={p.x}
                cy={p.y}
                r={4}
                className="fill-white stroke-[#10b981]"
                strokeWidth={2}
              />
            ))}

            {/* Leyenda */}
            <g transform={`translate(${paddingLeft}, ${chartHeight - 10})`}>
              <circle cx={0} cy={-4} r={5} fill="#165938" />
              <text
                x={10}
                y={0}
                className="fill-(--color-text-secondary) text-[11px] font-semibold"
              >
                Ingresos reales (últimos 30 días)
              </text>

              <circle cx={220} cy={-4} r={5} fill="#10b981" />
              <text
                x={230}
                y={0}
                className="fill-(--color-text-secondary) text-[11px] font-semibold"
              >
                Proyección IA (próximos 7 días)
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
