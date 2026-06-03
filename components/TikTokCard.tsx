import type { Product } from '@/lib/supabase';
import ChemistryCard from './ChemistryCard';
import EtransportCard from './EtransportCard';
import ToolCard from './ToolCard';

export default function TikTokCard({ p }: { p: Product }) {
  switch (p.category_type) {
    case 'etransport':
      return <EtransportCard p={p} />;
    case 'tools':
      return <ToolCard p={p} />;
    default:
      return <ChemistryCard p={p} />;
  }
}
