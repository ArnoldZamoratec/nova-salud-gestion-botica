import React from "react";

export default function GlobalLoader({
  width = "w-10",
  height = "h-10",
  className = "",
  fullScreen = false,
  message = "Preparando tu pedido...",
  subMessage = "Botica Nova Salud",
  showBrand = true,
  showProgress = true,
  creative = false,
  text = "text-(--color-primary-600)",
}) {
  // Normaliza la clase de color si se pasa sin 'text-' o con una clase personalizada
  const textColorClass =
    text.startsWith("text-") || text.startsWith("(")
      ? text.startsWith("(")
        ? `text-${text}`
        : text
      : text;

  // Muestra el spinner normal salvo que se pida el modo creativo
  if (!creative) {
    return (
      <div
        role="status"
        aria-label="Cargando"
        className={`inline-flex items-center justify-center relative ${className}`}
      >
        <svg
          className={`${width} ${height} animate-spin ${textColorClass}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25 stroke-current"
            cx="12"
            cy="12"
            r="10"
            strokeWidth="3"
          />
          <path
            className="opacity-90 fill-current"
            d="M4 12a8 8 0 018-8V2.5C6.753 2.5 2.5 6.753 2.5 12H4z"
          />
          {/* Mini cruz médica al centro */}
          <circle
            cx="12"
            cy="12"
            r="2"
            className="fill-current animate-ping"
            style={{ animationDuration: "1.5s" }}
          />
        </svg>
      </div>
    );
  }

  // Animación de carga completa de Nova Salud
  return (
    <div
      role="status"
      aria-label="Cargando Nova Salud"
      className={`flex flex-col items-center justify-center select-none ${
        fullScreen
          ? "fixed inset-0 z-50 bg-gray-50/90 dark:bg-[#121212]/90 backdrop-blur-md"
          : "min-h-[55vh] w-full py-12"
      } ${className}`}
    >
      {/* Contenedor visual */}
      <div className="relative flex items-center justify-center">
        {/* Anillo de pulso expansivo 1 */}
        <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 animate-pulse-ring-expand pointer-events-none" />

        {/* Anillo de pulso expansivo 2 (con retraso) */}
        <div
          className="absolute w-36 h-36 rounded-full bg-teal-500/15 dark:bg-teal-500/20 animate-pulse-ring-expand pointer-events-none"
          style={{ animationDelay: "0.7s" }}
        />

        {/* Aura de brillo ambiental */}
        <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500/25 via-teal-400/20 to-green-300/10 dark:from-emerald-600/30 dark:to-teal-500/20 blur-xl animate-pulse-aura pointer-events-none" />

        {/* Cruces médicas flotantes */}
        <div className="absolute -top-3 -right-4 animate-float-cross-1 pointer-events-none">
          <svg className="w-5 h-5 text-emerald-500/70" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
          </svg>
        </div>

        <div className="absolute -bottom-2 -left-5 animate-float-cross-2 pointer-events-none">
          <svg className="w-4 h-4 text-teal-400/70" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
          </svg>
        </div>

        <div className="absolute top-1 -left-4 animate-float-cross-3 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        </div>

        {/* Cápsula 3D central y pulso ECG */}
        <div className="relative z-10 animate-float-capsule filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.25)]">
          <svg
            className="w-28 h-28 sm:w-32 sm:h-32"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Degradado de la mitad verde */}
              <linearGradient id="capsuleGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="40%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>

              {/* Degradado de la mitad blanca */}
              <linearGradient id="capsuleWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#f3f4f6" />
                <stop offset="100%" stopColor="#e5e7eb" />
              </linearGradient>

              {/* Degradado de brillo */}
              <linearGradient id="capsuleShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              {/* Filtro de brillo ECG */}
              <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Anillo orbital */}
            <circle
              cx="60"
              cy="60"
              r="48"
              stroke="currentColor"
              className="text-emerald-500/20 dark:text-emerald-400/20"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />

            {/* Grupo de cápsula (rotado 45°) */}
            <g transform="rotate(45 60 60)">
              {/* Sombra exterior */}
              <rect
                x="38"
                y="20"
                width="44"
                height="80"
                rx="22"
                fill="none"
              />

              {/* Mitad superior: verde esmeralda */}
              <path
                d="M38 42 C38 29.85 47.85 20 60 20 C72.15 20 82 29.85 82 42 L82 60 L38 60 Z"
                fill="url(#capsuleGreen)"
              />

              {/* Mitad inferior: blanco */}
              <path
                d="M38 60 L82 60 L82 78 C82 90.15 72.15 100 60 100 C47.85 100 38 90.15 38 78 Z"
                fill="url(#capsuleWhite)"
              />

              {/* Línea divisoria central */}
              <line
                x1="37"
                y1="60"
                x2="83"
                y2="60"
                stroke="#0f766e"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />

              {/* Marca Rx en la mitad superior */}
              <g transform="translate(52, 33) scale(0.65)">
                <path
                  d="M4 2v12M4 2h5a3 3 0 0 1 0 6H4m5 0 4 6M13 10l3 4"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />
              </g>

              {/* Cruz médica en la mitad inferior */}
              <g transform="translate(54, 72) scale(0.6)">
                <path
                  d="M9 3v12M3 9h12"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Franja de reflejo */}
              <path
                d="M43 28 C43 28 47 23 54 22 L54 94 C48 93 43 89 43 89 Z"
                fill="url(#capsuleShine)"
                opacity="0.6"
              />
            </g>

            {/* Línea de pulso ECG dinámica en primer plano */}
            <path
              d="M15 60 Q35 60 44 60 L50 48 L56 74 L63 38 L70 68 L76 56 L82 60 Q95 60 105 60"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-ecg-pulse"
              filter="url(#ecgGlow)"
            />
          </svg>
        </div>

        {/* Sombra flotante de la cápsula */}
        <div className="absolute -bottom-4 w-20 h-3 rounded-full bg-emerald-950/15 dark:bg-emerald-900/40 blur-sm transform scale-x-125 animate-pulse-aura" />
      </div>

      {/* Marca e información de carga */}
      <div className="mt-8 flex flex-col items-center text-center max-w-xs px-4">
        {showBrand && (
          <div className="flex items-center gap-2 mb-2">
            <span className="font-['Pacifico'] text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500 animate-text-shimmer">
              Nova Salud
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
              Rx
            </span>
          </div>
        )}

        {/* Mensaje dinámico */}
        {message && (
          <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 tracking-wide">
            {message}
          </p>
        )}

        {subMessage && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 tracking-wider uppercase font-mono">
            {subMessage}
          </p>
        )}

        {/* Barra de progreso animada */}
        {showProgress && (
          <div className="w-40 sm:w-48 h-1.5 bg-gray-200/80 dark:bg-gray-800 rounded-full mt-4 overflow-hidden relative shadow-inner">
            <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-full animate-progress-slide shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
        )}
      </div>
    </div>
  );
}
