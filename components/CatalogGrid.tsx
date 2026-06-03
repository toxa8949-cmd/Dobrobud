import type { Product, CategoryType } from '@/lib/supabase';
import EtransportCard from './EtransportCard';
import ChemistryCard from './ChemistryCard';
import ToolCard from './ToolCard';

function renderCard(p: Product) {
  switch (p.category_type) {
    case 'etransport':
      return <EtransportCard key={p.id} p={p} />;
    case 'chemistry':
      return <ChemistryCard key={p.id} p={p} />;
    case 'tools':
      return <ToolCard key={p.id} p={p} />;
  }
}

export default function CatalogGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <p className="empty">Товарів поки немає. Підключіть фід у налаштуваннях.</p>;
  }
  return <div className="grid">{products.map(renderCard)}</div>;
}

export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton">
          <div className="card-img sk" />
          <div className="card-body">
            <div className="sk-line w70" />
            <div className="sk-line w40" />
            <div className="sk-line w50" />
          </div>
        </div>
      ))}
    </div>
  );
}
