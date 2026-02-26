export type AdsPlatform = "meta" | "google" | "tiktok";

export interface AdsCanalResumo {
  platform: AdsPlatform;
  label: string;
  color: string;
  leads: number;
  gastoTotal: number;
  receita: number;
  cpl: number;
  roas: number;
  impressoes: number;
  cliques: number;
  ctr: number;
}

export interface AdsDiario {
  data: string;
  meta: number;
  google: number;
  tiktok: number;
}

export interface CampanhaAds {
  id: string;
  nome: string;
  platform: AdsPlatform;
  status: "ativa" | "pausada" | "encerrada";
  gasto: number;
  leads: number;
  cpl: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  receita: number;
}

export const platformConfig: Record<AdsPlatform, { label: string; color: string; icon: string }> = {
  meta: { label: "Meta Ads", color: "#1877F2", icon: "📘" },
  google: { label: "Google Ads", color: "#EA4335", icon: "🔍" },
  tiktok: { label: "TikTok Ads", color: "#000000", icon: "🎵" },
};

export const mockCanaisResumo: AdsCanalResumo[] = [
  {
    platform: "meta",
    label: "Meta Ads",
    color: "#1877F2",
    leads: 127,
    gastoTotal: 8420,
    receita: 42500,
    cpl: 66.3,
    roas: 5.05,
    impressoes: 284000,
    cliques: 9120,
    ctr: 3.21,
  },
  {
    platform: "google",
    label: "Google Ads",
    color: "#EA4335",
    leads: 98,
    gastoTotal: 11200,
    receita: 38900,
    cpl: 114.29,
    roas: 3.47,
    impressoes: 195000,
    cliques: 7800,
    ctr: 4.0,
  },
  {
    platform: "tiktok",
    label: "TikTok Ads",
    color: "#000000",
    leads: 64,
    gastoTotal: 4150,
    receita: 18200,
    cpl: 64.84,
    roas: 4.39,
    impressoes: 520000,
    cliques: 14300,
    ctr: 2.75,
  },
];

export const mockLeadsPorDia: AdsDiario[] = [
  { data: "17/02", meta: 15, google: 12, tiktok: 8 },
  { data: "18/02", meta: 18, google: 14, tiktok: 6 },
  { data: "19/02", meta: 22, google: 11, tiktok: 10 },
  { data: "20/02", meta: 16, google: 16, tiktok: 9 },
  { data: "21/02", meta: 20, google: 13, tiktok: 12 },
  { data: "22/02", meta: 14, google: 10, tiktok: 7 },
  { data: "23/02", meta: 12, google: 8, tiktok: 5 },
  { data: "24/02", meta: 19, google: 15, tiktok: 11 },
  { data: "25/02", meta: 24, google: 17, tiktok: 14 },
  { data: "26/02", meta: 21, google: 14, tiktok: 9 },
];

export const mockGastoPorDia: AdsDiario[] = [
  { data: "17/02", meta: 780, google: 1050, tiktok: 380 },
  { data: "18/02", meta: 920, google: 1100, tiktok: 420 },
  { data: "19/02", meta: 1050, google: 980, tiktok: 510 },
  { data: "20/02", meta: 840, google: 1200, tiktok: 390 },
  { data: "21/02", meta: 960, google: 1150, tiktok: 460 },
  { data: "22/02", meta: 700, google: 900, tiktok: 340 },
  { data: "23/02", meta: 580, google: 750, tiktok: 280 },
  { data: "24/02", meta: 890, google: 1080, tiktok: 430 },
  { data: "25/02", meta: 1100, google: 1250, tiktok: 520 },
  { data: "26/02", meta: 950, google: 1100, tiktok: 450 },
];

export const mockCampanhas: CampanhaAds[] = [
  { id: "c1", nome: "Consórcio Auto Premium", platform: "meta", status: "ativa", gasto: 3200, leads: 48, cpl: 66.67, impressoes: 120000, cliques: 3800, ctr: 3.17, receita: 18500 },
  { id: "c2", nome: "Consórcio Imóvel - Retargeting", platform: "meta", status: "ativa", gasto: 2800, leads: 42, cpl: 66.67, impressoes: 85000, cliques: 2900, ctr: 3.41, receita: 15200 },
  { id: "c3", nome: "Consórcio Moto - Stories", platform: "meta", status: "pausada", gasto: 2420, leads: 37, cpl: 65.41, impressoes: 79000, cliques: 2420, ctr: 3.06, receita: 8800 },
  { id: "c4", nome: "Consórcio Auto - Search", platform: "google", status: "ativa", gasto: 4800, leads: 42, cpl: 114.29, impressoes: 82000, cliques: 3400, ctr: 4.15, receita: 17200 },
  { id: "c5", nome: "Consórcio Imóvel - Display", platform: "google", status: "ativa", gasto: 3600, leads: 31, cpl: 116.13, impressoes: 68000, cliques: 2600, ctr: 3.82, receita: 12800 },
  { id: "c6", nome: "Consórcio - Performance Max", platform: "google", status: "encerrada", gasto: 2800, leads: 25, cpl: 112.0, impressoes: 45000, cliques: 1800, ctr: 4.0, receita: 8900 },
  { id: "c7", nome: "Consórcio Auto - Feed TikTok", platform: "tiktok", status: "ativa", gasto: 2200, leads: 35, cpl: 62.86, impressoes: 310000, cliques: 8500, ctr: 2.74, receita: 10500 },
  { id: "c8", nome: "Consórcio Jovem - Spark Ads", platform: "tiktok", status: "ativa", gasto: 1950, leads: 29, cpl: 67.24, impressoes: 210000, cliques: 5800, ctr: 2.76, receita: 7700 },
];
