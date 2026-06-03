import { notFound } from 'next/navigation';
import { getAllByType, getFilterOptions, type CategoryType } from '@/lib/supabase';
import CatalogClient from '@/components/CatalogClient';

export const revalidate = 3600;

const META: Record<CategoryType, { title: string }> = {
  etransport: { title: 'Електротранспорт' },
  chemistry: { title: 'Автохімія та хімія' },
  tools: { title: 'Електроінструмент' },
};

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!(category in META)) notFound();

  const type = category as CategoryType;
  const [products, options] = await Promise.all([
    getAllByType(type),
    getFilterOptions(type),
  ]);

  return (
    <>
      <div className="section-head">
        <h2>{META[type].title}</h2>
      </div>
      <CatalogClient products={products} type={type} options={options} />
    </>
  );
}
