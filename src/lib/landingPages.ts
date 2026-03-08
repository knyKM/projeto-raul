export type LandingPageTemplate = 'completa' | 'simples' | 'destaque';

export interface LandingPageData {
  id: string;
  slug: string;
  template: LandingPageTemplate;
  vehicleName: string;
  brand: string;
  model: string;
  year: string;
  creditValue: number;
  installments: number;
  installmentValue: number;
  imageUrl: string;
  description: string;
  highlights: string[];
  whatsappNumber: string;
  createdAt: string;
}

const STORAGE_KEY = "sistemaleads_landing_pages";

export function getLandingPages(): LandingPageData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  // Migrate old pages without template field
  const pages = JSON.parse(data) as LandingPageData[];
  return pages.map(p => ({ ...p, template: p.template || 'completa' }));
}

export function getLandingPageBySlug(slug: string): LandingPageData | undefined {
  return getLandingPages().find((lp) => lp.slug === slug);
}

export function saveLandingPage(lp: LandingPageData) {
  const pages = getLandingPages();
  const idx = pages.findIndex((p) => p.id === lp.id);
  if (idx >= 0) pages[idx] = lp;
  else pages.push(lp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

export function deleteLandingPage(id: string) {
  const pages = getLandingPages().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
