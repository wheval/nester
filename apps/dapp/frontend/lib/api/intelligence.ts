// ── Types ─────────────────────────────────────────────────────────────────────

export interface VaultRecommendation {
  vaultId: string
  commentary: string
  percentileRank: number   // 0–100, e.g. 78 = "top 22% for its risk profile"
  recommendations: string[]
  confidence: number       // 0–1
}

export interface VaultSplitRecommendation {
  vault_id: string
  allocation_pct: number
  rationale: string
}

export interface VaultRecommendationPlan {
  recommended_vaults: VaultSplitRecommendation[]
  expected_yield_usdc: number
  confidence: 'high' | 'medium' | 'low'
}

export interface AnalyzeRecommendation {
  action: string
  rationale: string
  confidence: 'high' | 'medium' | 'low'
  confidence_reason: string
  data_freshness: string
  disclaimer: string
}

export interface VaultRecommendationInput {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  time_horizon_months: number
  initial_deposit_usdc: number
  savings_goal?: string
}

export interface MarketSentiment {
  signal: 'bull' | 'bear' | 'neutral'
  summary: string
  confidence: number
  updatedAt: string        // ISO timestamp
}

export interface PortfolioInsight {
  title: string
  body: string
  confidence: number
  action?: { label: string; href: string }
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface Milestone {
    date: string;
    target_amount: number;
    description: string;
}

export interface SavingsPlan {
    user_id: string;
    vault_id: string;
    goal_amount: number;
    current_balance: number;
    start_date: string;
    target_date: string;
    status: "on_track" | "behind_schedule" | "ahead_of_schedule";
    next_milestone: Milestone | null;
}

export interface SavingsPlanRequest {
    goal_usdc: number;
    time_horizon_months: number;
    max_monthly_contribution_usdc: number;
    vault_id?: string;
}

export interface ScheduleEntry {
    month: number;
    deposit: number;
    expected_balance: number;
    yield_earned: number;
}

export interface MilestoneProjection {
    month: number;
    expected_balance: number;
}

export interface SavingsPlanResponse {
    achievable: boolean;
    required_monthly_deposit: number;
    monthly_schedule: ScheduleEntry[];
    total_yield_earned: number;
    narrative: string;
    milestones: MilestoneProjection[];
}

// ── Base fetch helper ─────────────────────────────────────────────────────────

const BASE = '/api/v1'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Intelligence API error ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

// ── intelligence client ───────────────────────────────────────────────────────

export const intelligenceApi = {
  /** Per-vault AI commentary and recommendations. */
  getVaultRecommendations: (vaultId: string) =>
    apiFetch<VaultRecommendation>(`/vaults/${vaultId}/recommendations`),

  /** Bull/Bear/Neutral market sentiment summary. */
  getMarketSentiment: () =>
    apiFetch<MarketSentiment>('/market/sentiment'),

  /** Portfolio-level insight cards for a given user. */
  getPortfolioInsights: (userId: string) =>
    apiFetch<PortfolioInsight[]>(`/portfolio/${userId}/insights`),

  /** Fetch the active savings plan for the authenticated user. */
  getSavingsPlan: () =>
    apiFetch<SavingsPlan | null>('/intelligence/savings-plan'),

  /** Generate a concrete, personalized deposit schedule based on user goals. */
  createSavingsPlan: (request: SavingsPlanRequest) =>
    apiFetch<SavingsPlanResponse>('/intelligence/savings-plan', {
        method: 'POST',
        body: JSON.stringify(request),
    }),

  recommendVault: (input: VaultRecommendationInput) =>
    apiFetch<VaultRecommendationPlan>('/recommend/vault', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  analyze: (prompt: string) =>
    apiFetch<AnalyzeRecommendation>('/analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  sendMessage: (userId: string, message: string): EventSource => {
    const params = new URLSearchParams({ userId, message })
    return new EventSource(`${BASE}/intelligence/chat?${params}`)
  },
}

// Export as default or intelligence for backward compatibility if needed
export const intelligence = intelligenceApi;
