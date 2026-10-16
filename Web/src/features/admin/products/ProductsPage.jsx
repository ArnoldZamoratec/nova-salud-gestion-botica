import { useState } from "react";
import {
  Package,
  Trash2,
  Edit,
  Eye,
  PlusCircle,
  Search,
  Filter,
} from "lucide-react";
import DynamicTable from "../components/DynamicTable";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useGetProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../../products/api/productsApi";
import { useGetCategoriesQuery } from "../categories/api/categoriesApi";
import toast from "react-hot-toast";
import ProductActionModal from "./components/ProductActionModal";
import ProductDetailsModal from "./components/ProductDetailsModal";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsProductId, setDetailsProductId] = useState(null);

  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
  const categories = categoriesData?.data || [];

  const { data, isLoading } = useGetProductsQuery({
    page,
    limit,
    search: debouncedSearch,
    categoryName: categoryFilter,
    is_active: statusFilter,
  });

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const productsData = data?.data || [];
  const pagination = data?.pagination || { totalPages: 1 };

  const handleToggleStatus = async (row) => {
    try {
      const formData = new FormData();
      formData.append("is_active", !row.is_active);

      await updateProduct({ id: row._id, data: formData }).unwrap();
      toast.success("Estado del producto actualizado");
    } catch (error) {
      toast.error(error?.data?.message || "No se pudo actualizar el estado");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Producto eliminado correctamente");
      } catch (error) {
        toast.error(error?.data?.message || "No se pudo eliminar el producto");
      }
    }
  };

  const openEditModal = (row, e) => {
    e.stopPropagation();
    setProductToEdit(row);
    setIsActionModalOpen(true);
  };

  const openDetailsModal = (id) => {
    setDetailsProductId(id);
    setIsDetailsModalOpen(true);
  };

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setProductToEdit(null);
  };

  const columns = [
    {
      key: "product",
      label: "Producto",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-(--color-surface-muted) dark:bg-gray-800 overflow-hidden shrink-0 border border-(--color-border-base) dark:border-gray-700 flex items-center justify-center">
            {row.image ? (
              <img
                src={row.image}
                alt={row.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-full h-full p-2 text-(--color-text-muted)" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-(--color-text-primary) dark:text-white line-clamp-1">
              {row.name}
            </span>
            <span className="first-letter:uppercase text-xs text-(--color-text-secondary)">
              {row.category?.name || "Sin categoría"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Precio",
      render: (val) => (
        <span className="font-medium text-(--color-text-primary) dark:text-gray-100">
          S/ {val}
        </span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (val, row) => {
        let displayStock = `${val} unid.`;
        const hasStrips = row.has_strips || row.stripsPerBox > 0;
        const stripsPerBox =
          row.strips_per_box || row.strip_count || row.stripsPerBox || 1;

        if (hasStrips && stripsPerBox > 0) {
          const boxes = Math.floor(val / stripsPerBox);
          const remainingStrips = val % stripsPerBox;
          displayStock =
            remainingStrips > 0
              ? `${boxes} cj. y ${remainingStrips} bl.`
              : `${boxes} cj.`;
        }

        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              val > (row.min_stock ?? 10)
                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : val > 0
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {val > 0 ? displayStock : "Agotado"}
          </span>
        );
      },
    },
    {
      key: "is_active",
      label: "Estado",
      align: "center",
      render: (val, row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={val}
              onChange={() => handleToggleStatus(row)}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-(--color-primary-600)"></div>
          </label>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDetailsModal(row._id)}
            className="p-2 text-(--color-text-muted) hover:text-(--color-info-600) hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Ver detalle"
            aria-label="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => openEditModal(row, e)}
            className="p-2 text-(--color-text-muted) hover:text-(--color-primary-600) hover:bg-green-50 dark:hover:bg-green-900/20"
            title="Editar producto"
            aria-label="Editar producto"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleDelete(row._id, e)}
            className="p-2 text-(--color-text-muted) hover:text-(--color-danger-600) hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Eliminar producto"
            aria-label="Eliminar producto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-text-primary) dark:text-white">
            Gestión de productos
          </h1>
          <p className="text-sm text-(--color-text-secondary) dark:text-gray-400 mt-1">
            Administra tu inventario, precios y datos de productos.
          </p>
        </div>
        <Button
          variant="solid"
          size="md"
          onClick={() => {
            setProductToEdit(null);
            setIsActionModalOpen(true);
          }}
          className="bg-(--color-primary-700) hover:bg-(--color-primary-800) shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Agregar producto
        </Button>
      </div>

      <div className="bg-(--color-surface-card) dark:bg-(--color-panel-dark) p-4 rounded-xl shadow-sm border border-(--color-border-base) dark:border-gray-800 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            icon={<Search className="w-4 h-4 text-(--color-text-muted)" />}
            className="border-(--color-border-input) dark:border-gray-700 bg-(--color-surface-input) dark:bg-[#252525]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-text-muted) z-10 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-(--color-border-input) dark:border-gray-700 bg-(--color-surface-input) dark:bg-[#252525] text-(--color-text-primary) dark:text-white focus:ring-2 focus:ring-(--color-primary-500) outline-none transition-all cursor-pointer appearance-none text-sm"
            >
              <option value="">Todas las categorías</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-(--color-border-input) dark:border-gray-700 bg-(--color-surface-input) dark:bg-[#252525] text-(--color-text-primary) dark:text-white focus:ring-2 focus:ring-(--color-primary-500) outline-none transition-all cursor-pointer appearance-none text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      <DynamicTable
        columns={columns}
        data={productsData}
        rowKey="_id"
        isLoading={isLoading}
        currentPage={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        emptyMessage="No se encontraron productos."
        emptyIcon={Package}
        onRowClick={(row) => openDetailsModal(row._id)}
      />

      <ProductActionModal
        isOpen={isActionModalOpen}
        onClose={handleCloseActionModal}
        productToEdit={productToEdit}
      />

      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        productId={detailsProductId}
      />
    </div>
  );
}
