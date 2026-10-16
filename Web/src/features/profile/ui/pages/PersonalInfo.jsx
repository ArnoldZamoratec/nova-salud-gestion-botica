import { useState } from "react";
import { useGetMeQuery } from "../../store/userApi";
import GlobalLoader from "../../../../components/ui/GlobalLoader";
import EditProfileModal from "../components/EditProfileModal";
import { GENDER_LABELS } from "../../../../utils/labels";

export default function PersonalInfo() {
  const { data: response, isLoading, isError } = useGetMeQuery();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <GlobalLoader
          width="w-8"
          height="h-8"
          animate-spin
          text="text-(--color-primary-600)"
        />
      </div>
    );
  }

  if (isError || !response?.data) return null;

  const userData = response.data;

  const formatAddress = (addr) => {
    if (!addr || (!addr.city && !addr.street && !addr.label)) {
      return "No especificado";
    }
    const parts = [];
    if (addr.label) parts.push(`[${addr.label}]`);
    if (addr.street) parts.push(addr.street);
    if (addr.city) parts.push(addr.city);

    return parts.join(" - ");
  };

  const profileFields = [
    { label: "Nombre", value: userData.name || "No especificado" },
    { label: "Correo electrónico", value: userData.email || "No especificado" },
    { label: "Teléfono principal", value: userData.phone || "No especificado" },
    {
      label: "Fecha de nacimiento",
      value: userData.date_of_birth
        ? new Date(userData.date_of_birth).toLocaleDateString("es-PE")
        : "No especificado",
    },
    { label: "Género", value: GENDER_LABELS[userData.gender] || "No especificado" },
    { label: "Dirección", value: formatAddress(userData.address) },
  ];

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-(--color-text-primary) mb-2">
          Perfil
        </h2>
        <p className="text-(--color-text-secondary)">
          Administra los datos de tu perfil y mantén tu cuenta actualizada.
        </p>
      </div>

      <div className="bg-(--color-surface-card) rounded-3xl border border-(--color-border-base) p-8 shadow-sm">
        <div className="flex justify-between items-center border-b border-(--color-border-base) pb-6 mb-6">
          <h3 className="text-2xl font-semibold text-(--color-text-primary)">
            Información personal y de contacto
          </h3>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-(--color-primary-700) hover:bg-(--color-primary-800) text-white font-bold py-2.5 px-8 rounded-full transition-all active:scale-95 shadow-md"
          >
            Editar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profileFields.map((field, index) => (
            <div key={index} className="flex flex-col">
              <span className="text-sm font-bold text-(--color-text-label) mb-1">
                {field.label}
              </span>
              <span className="text-base text-(--color-text-body) capitalize">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
      />
    </div>
  );
}
