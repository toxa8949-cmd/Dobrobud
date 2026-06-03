import { XMLParser } from 'fast-xml-parser';
import type { FeedMapping, ParsedProduct } from './mappings/types';
import { mappings } from './mappings';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: true,
  trimValues: true,
});

function getPath(obj: any, path: string): any {
  // Підтримка шляхів типу "offer.price" або "param.@_name"
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function toArray<T>(v: T | T[] | undefined): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function slugify(s: string): string {
  const map: Record<string, string> = {
    а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ye',ж:'zh',з:'z',и:'y',і:'i',ї:'yi',
    й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',
    ц:'ts',ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'yu',я:'ya',
  };
  return s.toLowerCase().split('').map(c => map[c] ?? c).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

/**
 * Універсальний парсер. Один код для будь-якого джерела —
 * вся логіка конкретного фіда живе у mapping-конфігу.
 */
export function parseFeed(xmlString: string, mappingKey: string): ParsedProduct[] {
  const mapping: FeedMapping | undefined = mappings[mappingKey];
  if (!mapping) throw new Error(`Невідомий mapping: ${mappingKey}`);

  const root = parser.parse(xmlString);
  const rawOffers = toArray(getPath(root, mapping.offersPath));

  return rawOffers.map((offer) => {
    const title = String(getPath(offer, mapping.fields.title) ?? '').trim();
    const externalId = String(getPath(offer, mapping.fields.externalId) ?? offer['@_id'] ?? '');

    // Збираємо specs за правилами категорії
    const specs: Record<string, any> = {};
    const params = toArray(getPath(offer, mapping.paramsPath ?? 'param'));
    for (const [specKey, paramName] of Object.entries(mapping.specMap ?? {})) {
      const found = params.find((p: any) => p?.['@_name'] === paramName);
      if (found != null) {
        const val = found['#text'] ?? found;
        specs[specKey] = mapping.specParsers?.[specKey] ? mapping.specParsers[specKey](val) : val;
      }
    }

    const price = Number(getPath(offer, mapping.fields.price)) || null;
    const oldPrice = mapping.fields.oldPrice ? Number(getPath(offer, mapping.fields.oldPrice)) || null : null;

    return {
      externalId,
      title,
      slug: slugify(title) + '-' + externalId.slice(-6),
      description: String(getPath(offer, mapping.fields.description) ?? '').trim(),
      brand: mapping.fields.brand ? String(getPath(offer, mapping.fields.brand) ?? '') : null,
      price,
      oldPrice,
      categoryType: mapping.categoryType,
      images: toArray(getPath(offer, mapping.fields.images)).map(String).filter(Boolean),
      inStock: mapping.fields.available
        ? String(getPath(offer, mapping.fields.available)) !== 'false'
        : true,
      specs,
    };
  }).filter((p) => p.title && p.externalId);
}
