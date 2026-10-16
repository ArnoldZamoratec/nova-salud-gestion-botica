import { useState } from "react";

const faqs = [
  {
    question: "¿Cuál es su política de devoluciones?",
    answer:
      "Puedes devolver productos sin abrir dentro de los 7 días posteriores a la compra presentando tu comprobante.",
  },
  {
    question: "¿Hacen delivery a todo el Perú?",
    answer:
      "Hacemos delivery en Lima Metropolitana; para provincias el costo depende del destino.",
  },
  {
    question: "¿Cómo hago seguimiento a mi pedido?",
    answer:
      "Desde «Mis pedidos» en tu perfil puedes ver el estado de tu pedido en tiempo real.",
  },
];

export default function FAQAccordion() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) =>
    setActiveIndex(activeIndex === index ? null : index);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-20">
      <h3 className="text-3xl font-bold text-center text-(--color-text-primary) dark:text-white mb-10">
        Preguntas frecuentes
      </h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border border-(--color-border-base) dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-300 ${
              activeIndex === index
                ? "bg-green-50 dark:bg-green-900/10 border-(--color-primary-500)"
                : "bg-(--color-surface-card) dark:bg-[#1e1e1e]"
            }`}
          >
            <button
              aria-expanded={activeIndex === index}
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 flex justify-between items-center focus:outline-none"
            >
              <span
                className={`font-semibold text-left ${
                  activeIndex === index
                    ? "text-(--color-primary-700) dark:text-green-400"
                    : "text-(--color-text-primary) dark:text-white"
                }`}
              >
                {faq.question}
              </span>
              <span
                className={`text-2xl font-light transition-transform duration-300 ${
                  activeIndex === index
                    ? "text-(--color-primary-600) rotate-45"
                    : "text-(--color-text-muted)"
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                activeIndex === index
                  ? "max-h-40 py-4 border-t border-green-100 dark:border-green-800"
                  : "max-h-0"
              }`}
            >
              <p className="text-(--color-text-secondary) dark:text-gray-400">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
