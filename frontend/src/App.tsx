import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  Navigate,
} from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AddCustomer } from './pages/AddCustomer';
import { ScanQR } from './pages/ScanQR';
import { Customers } from './pages/Customers';
import { Offers } from './pages/Offers';

// Root layout
function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}

// Index redirect — proper named component so hooks are valid
function IndexRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}

// Auth guard — proper named component so hooks are valid
function ProtectedDashboard() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <Navigate to="/login" />;
}

function ProtectedAddCustomer() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AddCustomer /> : <Navigate to="/login" />;
}

function ProtectedScanQR() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <ScanQR /> : <Navigate to="/login" />;
}

function ProtectedCustomers() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Customers /> : <Navigate to="/login" />;
}

function ProtectedOffers() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Offers /> : <Navigate to="/login" />;
}

// Route definitions
const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexRedirect,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: ProtectedDashboard,
});

const addCustomerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-customer',
  component: ProtectedAddCustomer,
});

const scanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scan',
  component: ProtectedScanQR,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: ProtectedCustomers,
});

const offersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/offers',
  component: ProtectedOffers,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  addCustomerRoute,
  scanRoute,
  customersRoute,
  offersRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
