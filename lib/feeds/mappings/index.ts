import type { FeedMapping } from './types';

const num = (v: any) => {
  const m = String(v).match(/[\d.,]+/);
  return m ? Number(m[0].replace(',', '.')) : null;
};

/**
 * Приклад: типовий YML-фід (Prom/Rozetka формат) для електротранспорту.
 * Щоб додати нове джерело — створи новий об'єкт і додай у `mappings` нижче.
 * Код парсера чіпати НЕ треба.
 */
const ymlEtransport: FeedMapping = {
  offersPath: 'yml_catalog.shop.offers.offer',
  paramsPath: 'param',
  categoryType: 'etransport',
  fields: {
    externalId: '@_id',
    title: 'name',
    description: 'description',
    price: 'price',
    oldPrice: 'oldprice',
    brand: 'vendor',
    images: 'picture',
    available: '@_available',
  },
  specMap: {
    speed_kmh: 'Максимальна швидкість',
    range_km: 'Запас ходу',
    power_w: 'Потужність двигуна',
    battery: 'Акумулятор',
  },
  specParsers: {
    speed_kmh: num,
    range_km: num,
    power_w: num,
  },
};

const ymlChemistry: FeedMapping = {
  offersPath: 'yml_catalog.shop.offers.offer',
  paramsPath: 'param',
  categoryType: 'chemistry',
  fields: {
    externalId: '@_id',
    title: 'name',
    description: 'description',
    price: 'price',
    brand: 'vendor',
    images: 'picture',
    available: '@_available',
  },
  specMap: {
    volume_ml: 'Об\'єм',
    type: 'Тип засобу',
    for: 'Призначення',
  },
  specParsers: { volume_ml: num },
};

const ymlTools: FeedMapping = {
  offersPath: 'yml_catalog.shop.offers.offer',
  paramsPath: 'param',
  categoryType: 'tools',
  fields: {
    externalId: '@_id',
    title: 'name',
    description: 'description',
    price: 'price',
    brand: 'vendor',
    images: 'picture',
    available: '@_available',
  },
  specMap: {
    power_w: 'Потужність',
    voltage: 'Напруга',
    battery_count: 'Кількість акумуляторів',
  },
  specParsers: { power_w: num, battery_count: num },
};

export const mappings: Record<string, FeedMapping> = {
  'yml-etransport': ymlEtransport,
  'yml-chemistry': ymlChemistry,
  'yml-tools': ymlTools,
};
