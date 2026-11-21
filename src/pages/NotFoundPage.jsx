import { Link } from 'react-router-dom';
import { PageHeading } from '../components/common/PageHeading';

export function NotFoundPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="page-container">
        <PageHeading
          title="الصفحة دي مش موجودة"
          description="ارجع لصفحة التصميمات عشان تكمل إدارة الكتالوج."
        />
        <div className="mt-8">
          <Link to="/products" className="btn-primary">
            ارجع للتصميمات
          </Link>
        </div>
      </div>
    </section>
  );
}
