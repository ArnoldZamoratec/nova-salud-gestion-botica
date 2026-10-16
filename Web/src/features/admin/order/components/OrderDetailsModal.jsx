import { X, Package, MapPin, User, CreditCard } from "lucide-react";
import { useGetOrderByIdQuery } from "../api/ordersApi";
import Button from "../../../../components/ui/Button";

export default function OrderDetailsModal({ isOpen, onClose, orderId }) {
  const { data, isLoading, isError } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
  });

  if (!isOpen) return null;

  const order = data?.order;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-(--color-surface-card) dark:bg-(--color-panel-dark) w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-(--color-border-base) dark:border-gray-800">
          <h2 className="text-xl font-bold text-(--color-text-primary) dark:text-white">
            Detalle del pedido
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--color-primary-600)"></div>
            </div>
          ) : isError || !order ? (
            <div className="text-center py-10 text-(--color-danger-600)">
              No se pudo cargar el detalle del pedido.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-(--color-surface-page) dark:bg-[#252525] p-4 rounded-xl">
                <div>
                  <p className="text-sm text-(--color-text-secondary) dark:text-gray-400">
                    ID del pedido
                  </p>
                  <p className="font-mono font-semibold text-(--color-text-primary) dark:text-white">
                    #{order._id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-(--color-text-secondary) dark:text-gray-400">
                    Fecha
                  </p>
                  <p className="font-semibold text-(--color-text-primary) dark:text-white">
                    {new Date(order.createdAt).toLocaleString("es-PE")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-(--color-text-primary) dark:text-white uppercase tracking-wider">
                    <User className="w-4 h-4 text-(--color-primary-600)" />{" "}
                    Datos del cliente
                  </h3>
                  <div className="bg-(--color-surface-page) dark:bg-[#252525] p-4 rounded-xl text-sm">
                    <p className="font-medium text-(--color-text-primary) dark:text-white">
                      {order.user?.name}
                    </p>
                    <p className="text-(--color-text-secondary) mt-1">
                      {order.user?.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-(--color-text-primary) dark:text-white uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-(--color-primary-600)" />{" "}
                    Dirección de envío
                  </h3>
                  <div className="bg-(--color-surface-page) dark:bg-[#252525] p-4 rounded-xl text-sm">
                    {typeof order.address === "string" ? (
                      <p className="text-(--color-text-body) dark:text-gray-300">
                        {order.address}
                      </p>
                    ) : (
                      <>
                        <p className="text-(--color-text-body) dark:text-gray-300">
                          {order.address?.street}
                        </p>
                        <p className="text-(--color-text-secondary) mt-1">
                          {order.address?.city} {order.address?.postalCode}
                        </p>
                        {order.address?.phone && (
                          <p className="text-(--color-text-secondary) mt-1">
                            📞 {order.address.phone}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-(--color-text-primary) dark:text-white uppercase tracking-wider">
                  <Package className="w-4 h-4 text-(--color-primary-600)" />{" "}
                  Productos del pedido
                </h3>
                <div className="border border-(--color-border-base) dark:border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-(--color-surface-page) dark:bg-[#252525] text-(--color-text-secondary) dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Producto</th>
                        <th className="px-4 py-3 font-medium text-center">
                          Cant.
                        </th>
                        <th className="px-4 py-3 font-medium text-right">
                          Precio
                        </th>
                        <th className="px-4 py-3 font-medium text-right">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--color-border-base) dark:divide-gray-800">
                      {order.items?.map((item) => (
                        <tr
                          key={item._id}
                          className="bg-(--color-surface-card) dark:bg-[#1e1e1e]"
                        >
                          <td className="px-4 py-3 font-medium text-(--color-text-primary) dark:text-white">
                            {item.product?.name || "Producto eliminado"}
                          </td>
                          <td className="px-4 py-3 text-center text-(--color-text-secondary) dark:text-gray-300">
                            x{item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-(--color-text-secondary) dark:text-gray-300">
                            S/ {item.price?.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-(--color-text-primary) dark:text-white">
                            S/ {(item.quantity * item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-(--color-border-base) dark:border-gray-800">
                <div className="w-full sm:w-1/2 space-y-2">
                  <div className="flex justify-between items-center text-lg font-bold text-(--color-text-primary) dark:text-white">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-(--color-primary-600)" />{" "}
                      Importe total
                    </span>
                    <span>S/ {order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
