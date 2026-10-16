import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProfileRoute";
import AdminRoute from "./AdminRoute";
import GlobalLoader from "../../components/ui/GlobalLoader";
import { useSelector } from "react-redux";

const LandingPage = lazy(() => import("../../pages/Home/landingPage"));
const ProductDetails = lazy(
  () => import("../../features/products/ui/ProductDetails/ProductDetails"),
);
const CategoryView = lazy(
  () => import("../../features/products/ui/CategoryView/CategoryView"),
);
const Login = lazy(() => import("../../features/auth/ui/Login"));
const Signup = lazy(() => import("../../features/auth/ui/Signup"));
const NotFound = lazy(() => import("../../pages/Errors/NotFound"));
const Cart = lazy(() => import("../../features/cart/ui/Cart"));
const Policy = lazy(() => import("../../pages/Policy"));
const AboutSystem = lazy(() => import("../../pages/AboutSystem"));

const ProfileLayout = lazy(
  () => import("../../features/profile/ui/components/ProfileLayout"),
);
const PersonalInfo = lazy(
  () => import("../../features/profile/ui/pages/PersonalInfo"),
);
const OrderHistory = lazy(
  () => import("../../features/profile/ui/pages/OrderHistory"),
);
const Wishlist = lazy(() => import("../../features/profile/ui/pages/Wishlist"));

const DashboardLayout = lazy(
  () => import("../../features/admin/components/DashboardLayout"),
);
const ProductsPage = lazy(
  () => import("../../features/admin/products/ProductsPage"),
);
const UsersPage = lazy(
  () => import("../../features/admin/users/pages/UsersPage"),
);
const CategoriesPage = lazy(
  () => import("../../features/admin/categories/pages/CategoriesPage"),
);
const OrdersPage = lazy(() => import("../../features/admin/order/OrdersPage"));
const ReviewsPage = lazy(
  () => import("../../features/admin/reviews/pages/ReviewsPage"),
);
const DashboardPage = lazy(
  () => import("../../features/admin/dashboard/pages/DashboardPage"),
);

const CourierOverview = lazy(
  () => import("../../features/courier/ui/pages/CourierOverview"),
);
const CourierOrders = lazy(
  () => import("../../features/courier/ui/pages/CourierOrders"),
);

const isAdmin = (user) =>
  user?.role === "admin" || user?.role === "super_admin";

const RootHandler = () => {
  const user = useSelector((state) => state.auth.user);

  if (isAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.role === "courier") {
    return <Navigate to="/courier" replace />;
  }

  return <LandingPage />;
};

const GuestOnlyRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (user) {
    if (isAdmin(user)) {
      return <Navigate to="/dashboard" replace />;
    }

    if (user.role === "courier") {
      return <Navigate to="/courier" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
};

const CourierRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user || user.role !== "courier") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function AppRouter() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Inicio */}
        <Route path="/" element={<RootHandler />} />

        {/* Rutas para visitantes */}
        <Route
          path="/signup"
          element={
            <GuestOnlyRoute>
              <Signup />
            </GuestOnlyRoute>
          }
        />

        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <Login />
            </GuestOnlyRoute>
          }
        />

        {/* Rutas públicas */}
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category/:slug" element={<CategoryView />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/about-system" element={<AboutSystem />} />

        {/* Rutas protegidas del usuario */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="personal-info" element={<PersonalInfo />} />
          <Route path="wishlist" element={<Wishlist />} />
        </Route>

        {/* Rutas de administración */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <DashboardLayout />
            </AdminRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
        </Route>

        {/* Rutas del repartidor */}
        <Route
          path="/courier"
          element={
            <CourierRoute>
              <DashboardLayout />
            </CourierRoute>
          }
        >
          <Route index element={<CourierOverview />} />
          <Route path="orders" element={<CourierOrders />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
