import { useState } from "react";

export default function AddressBook() {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Libreta de direcciones
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Administra tus direcciones de envío y facturación para comprar más rápido.
        </p>
      </div>

      {!isAdding ? (
        <div className="bg-white dark:bg-[#252525] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-6 mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Direcciones guardadas
            </h3>
          </div>
          <div className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            Aún no tienes direcciones guardadas.
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-full active:scale-95 shadow-md"
          >
            Agregar nueva dirección
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#252525] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm max-w-2xl">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
            Agregar dirección
          </h3>

          <form className="flex flex-col gap-5">
            <div>
              <input
                type="text"
                placeholder="Nombres"
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg p-3.5 text-gray-900 dark:text-white outline-none focus:border-green-700 dark:focus:border-green-500 transition-colors placeholder:text-gray-500"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Apellidos"
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg p-3.5 text-gray-900 dark:text-white outline-none focus:border-green-700 dark:focus:border-green-500 transition-colors placeholder:text-gray-500"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="*Dirección"
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg p-3.5 text-gray-900 dark:text-white outline-none focus:border-green-700 dark:focus:border-green-500 transition-colors placeholder:text-gray-500 font-medium"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Dpto./Interior/Referencia (opcional)"
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg p-3.5 text-gray-900 dark:text-white outline-none focus:border-green-700 dark:focus:border-green-500 transition-colors placeholder:text-gray-500"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="*Ciudad"
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg p-3.5 text-gray-900 dark:text-white outline-none focus:border-green-700 dark:focus:border-green-500 transition-colors placeholder:text-gray-500 font-medium"
              />
            </div>

            <div className="relative">
              <select
                defaultValue=""
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg p-3.5 text-gray-900 dark:text-white outline-none focus:border-green-700 dark:focus:border-green-500 transition-colors appearance-none font-medium cursor-pointer"
              >
                <option value="" disabled className="text-gray-500">
                  *Elige el departamento
                </option>
                <option value="cairo" className="text-black">
                  Lima
                </option>
                <option value="giza" className="text-black">
                  Arequipa
                </option>
                <option value="alexandria" className="text-black">
                  Cusco
                </option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="flex gap-4 items-center mt-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="*Código postal"
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg p-3.5 text-gray-900 dark:text-white outline-none focus:border-green-700 dark:focus:border-green-500 transition-colors placeholder:text-gray-500 font-medium"
                />
              </div>
              <span className="text-gray-400 font-bold hidden sm:block">—</span>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Distrito (opcional)"
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg p-3.5 text-gray-900 dark:text-white outline-none focus:border-green-700 dark:focus:border-green-500 transition-colors placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <input
                type="checkbox"
                id="preferred"
                className="w-5 h-5 accent-green-700 cursor-pointer rounded"
              />
              <label
                htmlFor="preferred"
                className="text-gray-700 dark:text-gray-300 cursor-pointer font-medium select-none"
              >
                Usar como dirección principal
              </label>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <button
                type="button"
                className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-full active:scale-95 shadow-md"
              >
                Guardar cambios
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-gray-900 dark:text-white font-bold hover:underline transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
