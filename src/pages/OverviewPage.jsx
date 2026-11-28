import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HandoffImportButton } from '../components/common/HandoffImportButton';
import { PageHeading } from '../components/common/PageHeading';
import { CatalogCoverageCard } from '../components/dashboard/CatalogCoverageCard';
import { DashboardKpiStrip } from '../components/dashboard/DashboardKpiStrip';
import { FulfillmentPolicyCard } from '../components/dashboard/FulfillmentPolicyCard';
import { MissingModelsCard } from '../components/dashboard/MissingModelsCard';
import { OrderPipelineSection } from '../components/dashboard/OrderPipelineSection';
import { OrderDetailDrawer } from '../components/orders/OrderDetailDrawer';
import { useAdmin } from '../context/AdminContext';
import { computeDashboardMetrics } from '../utils/dashboardMetrics';

/**
 * `/overview` — Full غلاف Storefront-Synced Operations & Store Health Dashboard.
 * Every KPI, queue row, model coverage alert, and COD policy card derives live from AdminContext.
 */
export function OverviewPage() {
  const {
    role,
    storeConfig,
    products,
    categories,
    models,
    phoneBrands,
    governorates,
    materials,
    orders,
    missingModelRequests,
  } = useAdmin();

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const metrics = useMemo(
    () =>
      computeDashboardMetrics({
        orders,
        missingModelRequests,
        products,
        categories,
        models,
        phoneBrands,
        governorates,
        materials,
        storeConfig,
      }),
    [
      orders,
      missingModelRequests,
      products,
      categories,
      models,
      phoneBrands,
      governorates,
      materials,
      storeConfig,
    ]
  );

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  return (
    <div className="pt-4 md:pt-6">
      <div className="page-container space-y-6">
        {/* Dashboard Command Header */}
        <PageHeading
          title="المتابعة اليومية"
          count={orders.length}
          description={`نظرة شاملة على طلبات ${storeConfig.name}، الموديلات المطلوبة، وتغطية الكتالوج والشحن.`}
          action={
            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
              <HandoffImportButton label="استورد أوردرات JSON" variant="outline" />
              <Link to="/orders" className="btn-primary !min-h-[44px]">
                إدارة الطلبات
              </Link>
              {role === 'manager' ? (
                <Link to="/products" className="btn-outline !min-h-[44px]">
                  التصميمات
                </Link>
              ) : null}
            </div>
          }
        />

        {/* 4 Live Operational KPI Cards */}
        <DashboardKpiStrip metrics={metrics} currencyLabel={storeConfig.currencyLabel} />

        {/* 12-Column Asymmetric Workspace: Urgent Order Queue (8 cols) + Triage & Coverage (4 cols) */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <OrderPipelineSection
              metrics={metrics}
              onOpenOrder={(orderId) => setSelectedOrderId(orderId)}
            />
          </div>

          <aside aria-label="تنبيهات الموديلات والكتالوج" className="space-y-6 lg:col-span-4">
            <MissingModelsCard metrics={metrics} />
            <CatalogCoverageCard metrics={metrics} />
            <FulfillmentPolicyCard metrics={metrics} />
          </aside>
        </div>
      </div>

      {/* Print-ready Order Detail Drawer launched directly from Dashboard */}
      <OrderDetailDrawer
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
