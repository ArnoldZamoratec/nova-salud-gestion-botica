import { Cpu, ShieldCheck, Activity, Truck, HeartHandshake, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutSystem() {
  const features = [
    {
      icon: <Cpu className="w-8 h-8 text-emerald-500" />,
      title: "Asistente virtual NovaBot",
      desc: "Nuestro asistente con IA atiende 24/7: busca medicamentos y alternativas, consulta disponibilidad de stock y el estado de tus pedidos al instante.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
      title: "Control de recetas",
      desc: "Los productos que requieren receta están identificados y el químico farmacéutico valida la receta antes de dispensarlos.",
    },
    {
      icon: <Activity className="w-8 h-8 text-emerald-500" />,
      title: "Alertas inteligentes de inventario",
      desc: "Control de inventario en tiempo real. Notifica automáticamente al administrador cuando un producto llega a su stock mínimo para reponerlo a tiempo.",
    },
    {
      icon: <Truck className="w-8 h-8 text-emerald-500" />,
      title: "Cadena de frío",
      desc: "Los productos sensibles (como insulinas o vacunas) se entregan con control de temperatura para conservar su calidad hasta tu puerta.",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Explora y busca",
      desc: "Encuentra medicamentos por nombre, categoría o dolencia desde el buscador del catálogo.",
    },
    {
      step: "02",
      title: "Consulta a NovaBot",
      desc: "Conversa con nuestro asistente virtual para orientarte sobre productos, componentes y alternativas.",
    },
    {
      step: "03",
      title: "Validación del químico farmacéutico",
      desc: "Un químico farmacéutico colegiado revisa las recetas de los medicamentos controlados.",
    },
    {
      step: "04",
      title: "Delivery express",
      desc: "Empaquetado de forma segura y entregado por delivery local express.",
    },
  ];

  return (
    <div className="min-h-screen bg-(--color-surface-page) dark:bg-[#121212] py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Banner principal */}
        <div className="bg-gradient-to-r from-[#0a3c2f] to-[#2c6e49] rounded-3xl overflow-hidden mb-16 relative shadow-2xl">
          {/* Círculos decorativos de fondo */}
          <svg className="absolute inset-0 w-full h-full text-white/5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90%" cy="10%" r="200" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" />
            <circle cx="10%" cy="90%" r="150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
          </svg>

          <div className="p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="md:w-3/5 text-left">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-400/20">
                Descripción del sistema
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 mb-6 leading-tight">
                Sistema web de gestión de la botica Nova Salud
              </h1>
              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed mb-8">
                Nova Salud centraliza y automatiza el inventario, las ventas y la atención al cliente de la botica: stock actualizado en tiempo real, alertas automáticas de reposición, registro de ventas y un asistente virtual que agiliza la atención.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/category/pain-relief"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                >
                  Ver productos
                </Link>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="relative p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-3xl text-center w-64">
                <div className="absolute inset-0 bg-emerald-400/10 rounded-3xl blur-xl -z-10 animate-pulse"></div>
                <HeartHandshake className="w-16 h-16 text-emerald-300 mx-auto mb-4 animate-bounce" />
                <h4 className="text-lg font-bold text-white mb-1">Tu aliado de confianza</h4>
                <p className="text-xs text-white/70">Químicos farmacéuticos y control automatizado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cuadrícula de estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { value: "10k+", label: "Pedidos entregados" },
            { value: "24/7", label: "Consultas con IA" },
            { value: "99.4%", label: "Precisión de inventario" },
            { value: "100%", label: "Datos protegidos" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-(--color-surface-card) dark:bg-[#1e1e1e] border border-(--color-border-base) dark:border-gray-800 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-3xl font-black text-emerald-600 dark:text-green-400 mb-1">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Funciones principales del sistema */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
              Diseñado para la seguridad del paciente
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Nova Salud combina automatización con la atención de químicos farmacéuticos para despachar rápido sin descuidar la seguridad.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feat, index) => (
              <div
                key={index}
                className="bg-(--color-surface-card) dark:bg-[#1e1e1e] hover:bg-emerald-500/5 border border-(--color-border-base) dark:border-gray-800 rounded-3xl p-8 shadow-sm transition-all hover:-translate-y-1 duration-300 text-left"
              >
                <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feat.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Flujo de trabajo */}
        <div className="bg-(--color-surface-card) dark:bg-[#1e1e1e] border border-(--color-border-base) dark:border-gray-800 rounded-3xl p-8 sm:p-12 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
              Cómo funciona Nova Salud
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Un proceso sencillo desde tu primer clic hasta recibir tus medicamentos.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4 relative">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col text-left relative z-10">
                <div className="text-5xl font-black text-emerald-500/10 dark:text-emerald-500/20 mb-4">{step.step}</div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {step.title}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
