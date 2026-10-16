import { Package } from "lucide-react";
import { useOrderHistoryLogic } from "../../hooks/useOrderHistoryLogic";
import OrderFilters from "../components/OrderFilters";
import OrderCard from "../components/OrderCard";
import GlobalLoader from "../../../../components/ui/GlobalLoader";

export default function OrderHistory() {
  const {
    isLoading,
    isEmpty,
    filteredOrders,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    cancellingId,
    handleCancelOrder,
  } = useOrderHistoryLogic();

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Estado e historial de pedidos
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Consulta la información completa y el seguimiento de tus pedidos.
      </p>

      <OrderFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20 text-green-600">
          <GlobalLoader width="w-10" height="h-10" animate-spin text="text-green-600" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-[#252525] rounded-2xl border border-gray-100 dark:border-gray-800">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No se encontraron pedidos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Ajusta los filtros o realiza un nuevo pedido.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              cancellingId={cancellingId}
              onCancel={handleCancelOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}