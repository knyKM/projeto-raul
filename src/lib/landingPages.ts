import { api } from "@/lib/apiClient";

export type LandingPageTemplate = 'completa' | 'simples' | 'destaque' | 'apelativo';

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

// Cache in memory to avoid repeated API calls within the same session
let cachedPages: LandingPageData[] | null = null;

export async function fetchLandingPages(): Promise<LandingPageData[]> {
  const res = await api.get<LandingPageData[]>('/landing-pages');
  if (res.ok && res.data) {
    cachedPages = res.data;
    return res.data;
  }
  return cachedPages || [];
}

export async function fetchLandingPageBySlug(slug: string): Promise<LandingPageData | undefined> {
  const res = await api.get<LandingPageData>(`/landing-pages/by-slug/${slug}`);
  if (res.ok && res.data) return res.data;
  return undefined;
}

export async function saveLandingPageApi(lp: LandingPageData): Promise<boolean> {
  const res = await api.post('/landing-pages', lp);
  if (res.ok) cachedPages = null; // invalidate cache
  return res.ok;
}

export async function deleteLandingPageApi(id: string): Promise<boolean> {
  const res = await api.delete(`/landing-pages/${id}`);
  if (res.ok) cachedPages = null;
  return res.ok;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Legacy sync-compatible wrappers (kept for backward compat) ──
// These are synchronous stubs that return cached data. 
// Components should migrate to async versions above.
export function getLandingPages(): LandingPageData[] {
  return cachedPages || [];
}

export function getLandingPageBySlug(slug: string): LandingPageData | undefined {
  return (cachedPages || []).find((lp) => lp.slug === slug);
}
