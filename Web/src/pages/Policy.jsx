import { RefreshCcw, FileText, Truck, Lock } from "lucide-react";
import policyImage from "../assets/Profile/policy-hero.webp";

export default function Policy() {
  const policies = [
    {
      icon: (
        <Lock className="w-6 h-6 text-(--color-primary-600) dark:text-green-400" />
      ),
      title: "1. Privacidad y seguridad de datos",
      content:
        "Tu historial de compras y tus datos son estrictamente confidenciales, conforme a la Ley N.° 29733 de Protección de Datos Personales. Las contraseñas se almacenan cifradas y nunca compartimos tus datos con terceros.",
    },
    {
      icon: (
        <FileText className="w-6 h-6 text-(--color-primary-600) dark:text-green-400" />
      ),
      title: "2. Venta con receta médica",
      content:
        "Los medicamentos marcados como «Requiere receta» solo se dispensan con una receta médica válida y vigente emitida por un profesional colegiado. Nuestro químico farmacéutico puede verificar o rechazar cualquier receta.",
    },
    {
      icon: (
        <RefreshCcw className="w-6 h-6 text-(--color-primary-600) dark:text-green-400" />
      ),
      title: "3. Política de cambios y devoluciones",
      content:
        "Los productos sin abrir pueden devolverse dentro de los 7 días presentando el comprobante. Por normas sanitarias, los productos refrigerados (p. ej. insulinas) y los preparados magistrales no admiten devolución.",
    },
    {
      icon: (
        <Truck className="w-6 h-6 text-(--color-primary-600) dark:text-green-400" />
      ),
      title: "4. Envíos y delivery",
      content:
        "Entregamos en Lima Metropolitana en un plazo de 24 a 48 horas. Nova Salud no se responsabiliza por demoras causadas por direcciones incorrectas. Las entregas urgentes están sujetas a disponibilidad.",
    },
  ];

  return (
    <div className="min-h-screen bg-(--color-surface-page) dark:bg-[#121212] py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Sección principal */}
        <div className="bg-(--color-surface-card) dark:bg-[#1e1e1e] rounded-3xl shadow-sm border border-(--color-border-base) dark:border-gray-800 overflow-hidden mb-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-black text-(--color-text-primary) dark:text-white mb-4 leading-tight">
                Términos y política de privacidad
              </h1>
              <p className="text-lg text-(--color-text-secondary) dark:text-gray-400 leading-relaxed">
                En Nova Salud priorizamos tu salud, tu privacidad y tu seguridad. Lee nuestras políticas para conocer cómo te protegemos y qué esperamos de nuestros usuarios.
              </p>
            </div>
            <div className="md:w-1/2 bg-(--color-surface-page) dark:bg-[#252525] p-8 flex justify-center items-center">
              <img
                src={policyImage}
                alt="Ilustración de seguridad y términos"
                className="max-w-full h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Sección de contenido */}
        <div className="bg-(--color-surface-card) dark:bg-[#1e1e1e] rounded-3xl shadow-sm border border-(--color-border-base) dark:border-gray-800 p-8 md:p-12">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-(--color-text-primary) dark:text-white mb-4">
              Aceptación de los términos
            </h2>
            <p className="text-(--color-text-secondary) dark:text-gray-400 leading-relaxed">
              Al acceder y usar la plataforma de Nova Salud aceptas estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, por favor no utilices nuestros servicios. Estos términos aplican a todos los visitantes, usuarios y demás personas que accedan a la botica en línea.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {policies.map((policy, index) => (
              <div
                key={index}
                className="bg-(--color-surface-page) dark:bg-[#252525] rounded-2xl p-6 border border-(--color-border-base) dark:border-gray-700 hover:border-(--color-primary-300) dark:hover:border-green-700 transition-colors"
              >
                <div className="w-12 h-12 bg-(--color-surface-card) dark:bg-[#1e1e1e] rounded-xl shadow-sm flex items-center justify-center mb-4 border border-(--color-border-base) dark:border-gray-700">
                  {policy.icon}
                </div>
                <h3 className="text-xl font-bold text-(--color-text-primary) dark:text-white mb-3">
                  {policy.title}
                </h3>
                <p className="text-(--color-text-secondary) dark:text-gray-400 leading-relaxed">
                  {policy.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
