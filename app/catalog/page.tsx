import { redirect } from 'next/navigation';

// Загальний каталог веде одразу на Транспорт — без проміжного екрану.
// Перемикання між розділами доступне в боковій панелі.
export default function CatalogIndexPage() {
  redirect('/catalog/etransport');
}
