export default function OrderFilters({
  statusFilter,
  setStatusFilter,
  timeFilter,
  setTimeFilter,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Mostrar
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-white dark:bg-[#252525] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-3 outline-none focus:border-green-600 font-medium appearance-none"
        >
          <option value="all">Todos los pedidos</option>
          <option value="pending">Pedidos pendientes</option>
          <option value="shipped">Pedidos enviados</option>
          <option value="delivered">Pedidos entregados</option>
          <option value="canceled">Pedidos cancelados</option>
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Desde
        </label>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="w-full bg-white dark:bg-[#252525] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-3 outline-none focus:border-green-600 font-medium appearance-none"
        >
          <option value="30_days">Últimos 30 días</option>
          <option value="6_months">Últimos 6 meses</option>
          <option value="all_time">Todo el tiempo</option>
        </select>
      </div>
    </div>
  );
}
