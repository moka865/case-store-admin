import { MotionConfig } from 'motion/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { AdminLayout } from './layout/AdminLayout';
import { CategoriesPage } from './pages/CategoriesPage';
import { ModelsPage } from './pages/ModelsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductsPage } from './pages/ProductsPage';
import { ShippingPage } from './pages/ShippingPage';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/products" replace />} />
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
