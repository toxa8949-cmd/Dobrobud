import type { Product } from '@/lib/supabase';
import ChemistryCard from './ChemistryCard';
import EtransportCard from './EtransportCard';
import ToolCard from './ToolCard';

function renderCard(p: Product) {
  switch (p.category_type) {
    case 'etransport': return <EtransportCard key={p.id} p={p} />;
    case 'chemistry': return <ChemistryCard key={p.id} p={p} />;
    case 'tools': return <ToolCard key={p.id} p={p} />;
  }
}

export default function ProductRow({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Product[];
}) {
  if (!products.length) return null;
  return (
    <section className="prow">
      <div className="section-head">
        <h2>{title}</h2>
        <a href={href}>Усі товари →</a>
      </div>
      <div className="prow-scroll">
        {products.map((p) => (
          <div className="prow-item" key={p.id}>{renderCard(p)}</div>
        ))}
      </div>
    </section>
  );
}
