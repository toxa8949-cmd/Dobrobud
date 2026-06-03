export type CategoryType = 'etransport' | 'chemistry' | 'tools';

export interface ParsedProduct {
  externalId: string;
  title: string;
  slug: string;
  description: string;
  brand: string | null;
  price: number | null;
  oldPrice: number | null;
  categoryType: CategoryType;
  images: string[];
  inStock: boolean;
  specs: Record<string, any>;
}

export interface FeedMapping {
  // Шлях до масиву товарів у структурі фіда, напр. "yml_catalog.shop.offers.offer"
  offersPath: string;
  // Шлях до масиву <param> всередині товару (для YML)
  paramsPath?: string;
  categoryType: CategoryType;
  fields: {
    externalId: string;
    title: string;
    description: string;
    price: string;
    oldPrice?: string;
    brand?: string;
    images: string;
    available?: string;
  };
  // Які <param name="..."> витягувати в specs і під яким ключем
  specMap?: Record<string, string>;
  // Опційні перетворювачі значень (напр. "45 км/год" -> 45)
  specParsers?: Record<string, (v: any) => any>;
}
