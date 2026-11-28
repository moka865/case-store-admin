import { Link } from 'react-router-dom';
import { HandoffImportButton } from '../components/common/HandoffImportButton';
import { PageHeading } from '../components/common/PageHeading';
import { useAdmin } from '../context/AdminContext';

/**
 * Lightweight M2 route placeholder — full Missing Models triage ledger arrives in M3.
 */
export function MissingModelsPage() {
  const { missingModelRequests } = useAdmin();

  return (
    <div className="pt-6 md:pt-10">
      <div className="page-container">
        <PageHeading
          title="الموديلات الناقصة"
          count={missingModelRequests.length}
          description="صفحة متابعة طلبات الموديلات الناقصة وإضافتها للكتالوج هتكتمل في المرحلة الجاية (M3)."
          action={<HandoffImportButton label="استورد طلبات JSON" />}
        />

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link to="/orders" className="btn-secondary">
            ارجع للطلبات
          </Link>
          <Link to="/models" className="btn-secondary">
            إدارة الموديلات
          </Link>
        </div>
      </div>
    </div>
  );
}
