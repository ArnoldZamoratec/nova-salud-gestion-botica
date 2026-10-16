import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/NavBar/Header";
import SubNavbar from "./components/SubNavBar/SubNavbar";
import AppRouter from "./app/router/AppRouter";
import Footer from "./components/Footer/footer";
import ChatBotWidget from "./features/chatbot/components/ChatBotWidget";
import GlobalLoader from "./components/ui/GlobalLoader";

export default function App() {
  const { darkMode } = useSelector((state) => state.ui);
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(() => {
    if (typeof window !== "undefined") {
      const hasSeenHomeLoader = sessionStorage.getItem("hasSeenHomeLoader");
      const isHome = window.location.pathname === "/" || window.location.pathname === "";
      return !hasSeenHomeLoader && isHome;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Vuelve arriba al cambiar de ruta
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  // Controla el tiempo de la pantalla de carga inicial
  useEffect(() => {
    if (isNavigating) {
      sessionStorage.setItem("hasSeenHomeLoader", "true");
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  const isDashboard = location.pathname.startsWith("/dashboard");
  const isCourier = location.pathname.startsWith("/courier");
  const authPaths = ["/login", "/signup"];
  const shouldHideNavbar = isDashboard || isCourier || authPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen w-full transition relative">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Pantalla de carga global: solo al abrir el inicio por primera vez */}
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50/95 dark:bg-[#121212]/95 backdrop-blur-md transition-all duration-500 ease-in-out ${
          isNavigating
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
        aria-hidden={!isNavigating}
      >
        <GlobalLoader
          creative={true}
          fullScreen={false}
          message="Cargando tus productos de salud..."
          subMessage="Botica Nova Salud"
        />
      </div>

      {!shouldHideNavbar && (
        <>
          <Navbar />
          <SubNavbar />
        </>
      )}

      <main
        className={`grow w-full flex flex-col ${!shouldHideNavbar ? "pt-28" : ""}`}
      >
        <AppRouter />
        {!shouldHideNavbar && <Footer />}
      </main>

      <ChatBotWidget />
    </div>
  );
}
