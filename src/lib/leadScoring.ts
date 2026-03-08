// Lead Scoring — calculates a score for each lead to prioritize follow-up
// Score range: 0-100
// Categories: 🔥 Quente (≥70), 🟡 Morno (40-69), 🔵 Frio (<40)

export interface LeadScoreResult {
  score: number;
  label: 'quente' | 'morno' | 'frio';
  emoji: string;
  color: string;
  reasons: string[];
}

export interface LeadBehavior {
  page_views: number;
  time_on_page_seconds: number;
  chat_interactions: number;
  scroll_depth: number;
  form_started: boolean;
}

interface LeadForScoring {
  email: string | null;
  origem: string;
  landing_page_slug: string | null;
  created_at: string;
  status: string;
}

export function calculateLeadScore(lead: LeadForScoring, behavior?: LeadBehavior): LeadScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Has email (+10)
  if (lead.email) {
    score += 10;
    reasons.push('Informou e-mail');
  }

  // 2. Origin bonus
  if (lead.origem === 'landing_page') {
    score += 12;
    reasons.push('Via landing page');
  } else if (lead.origem === 'whatsapp') {
    score += 15;
    reasons.push('Via WhatsApp');
  } else if (lead.origem === 'formulario') {
    score += 10;
    reasons.push('Via formulário');
  }

  // 3. Has landing page slug (+5)
  if (lead.landing_page_slug) {
    score += 5;
    reasons.push('Oferta específica');
  }

  // 4. Recency bonus
  const minutesAgo = (Date.now() - new Date(lead.created_at).getTime()) / 60000;
  if (minutesAgo <= 5) {
    score += 20;
    reasons.push('Chegou agora');
  } else if (minutesAgo <= 15) {
    score += 15;
    reasons.push('Menos de 15min');
  } else if (minutesAgo <= 60) {
    score += 10;
    reasons.push('Menos de 1h');
  } else if (minutesAgo <= 360) {
    score += 3;
    reasons.push('Hoje');
  }

  // 5. Still pending bonus (+5)
  if (lead.status === 'novo') {
    score += 5;
    reasons.push('Aguardando contato');
  }

  // ─── BEHAVIOR SCORING (up to +33 extra points) ───
  if (behavior) {
    // Pages visited (+8 max)
    if (behavior.page_views >= 3) {
      score += 8;
      reasons.push(`${behavior.page_views} páginas visitadas`);
    } else if (behavior.page_views >= 2) {
      score += 5;
      reasons.push('2 páginas visitadas');
    }

    // Time on page (+10 max)
    if (behavior.time_on_page_seconds >= 120) {
      score += 10;
      reasons.push('2+ min na página');
    } else if (behavior.time_on_page_seconds >= 60) {
      score += 6;
      reasons.push('1+ min na página');
    } else if (behavior.time_on_page_seconds >= 30) {
      score += 3;
      reasons.push('30s+ na página');
    }

    // Chat interactions (+10 max)
    if (behavior.chat_interactions >= 3) {
      score += 10;
      reasons.push(`${behavior.chat_interactions} msgs no chat`);
    } else if (behavior.chat_interactions >= 1) {
      score += 6;
      reasons.push('Interagiu no chat');
    }

    // Scroll depth (+3)
    if (behavior.scroll_depth >= 80) {
      score += 3;
      reasons.push('Leu a página toda');
    }

    // Form started (+2)
    if (behavior.form_started) {
      score += 2;
      reasons.push('Iniciou formulário');
    }
  }

  // Clamp
  score = Math.min(100, Math.max(0, score));

  let label: LeadScoreResult['label'];
  let emoji: string;
  let color: string;

  if (score >= 70) {
    label = 'quente';
    emoji = '🔥';
    color = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30';
  } else if (score >= 40) {
    label = 'morno';
    emoji = '🟡';
    color = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
  } else {
    label = 'frio';
    emoji = '🔵';
    color = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30';
  }

  return { score, label, emoji, color, reasons };
}

// Timer helpers
export function getElapsedTime(createdAt: string): { text: string; urgency: 'ok' | 'warning' | 'critical' } {
  const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);

  if (minutes < 1) return { text: 'Agora', urgency: 'ok' };
  if (minutes < 60) return { text: `${minutes}min`, urgency: minutes >= 15 ? 'critical' : minutes >= 5 ? 'warning' : 'ok' };

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { text: `${hours}h${minutes % 60 > 0 ? `${minutes % 60}min` : ''}`, urgency: 'critical' };

  const days = Math.floor(hours / 24);
  return { text: `${days}d`, urgency: 'critical' };
}

export function getUrgencyColor(urgency: 'ok' | 'warning' | 'critical'): string {
  switch (urgency) {
    case 'ok': return 'text-emerald-600 dark:text-emerald-400';
    case 'warning': return 'text-amber-600 dark:text-amber-400';
    case 'critical': return 'text-red-600 dark:text-red-400 animate-pulse';
  }
}
