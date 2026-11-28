import { MotionConfig } from 'motion/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminLayout } from './layout/AdminLayout';
import { CategoriesPage } from './pages/CategoriesPage';
import { MissingModelsPage } from './pages/MissingModelsPage';
import { ModelsPage } from './pages/ModelsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrdersPage } from './pages/OrdersPage';
import { OverviewPage } from './pages/OverviewPage';
import { ProductsPage } from './pages/ProductsPage';
import { ShippingPage } from './pages/ShippingPage';

function RoleHomeRedirect() {
  const { role } = useAdmin();
  return <Navigate to={role === 'catalog' ? '/products' : '/overview'} replace />;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<RoleHomeRedirect />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/missing-models" element={<MissingModelsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </MotionConfig>
  );
}
