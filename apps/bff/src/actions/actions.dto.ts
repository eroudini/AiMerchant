export type GenerateRecommendationsBody = {
  product_ids?: string[];
  horizon_days?: number; // default 14
  min_days_cover?: number; // default 7
  country?: string;
};

export type ExecuteActionsBody = {
  ids: string[];
  note?: string;
};

export type RecommendationRow = {
  id: string;
  account_id: string;
  product_code: string | null;
  country: string | null;
  type: string;
  status: string;
  payload: any;
  note: string | null;
  created_at: string;
};

export type ListRecommendationsQuery = {
  status?: string; // draft|approved|executed|cancelled
  type?: string; // po|price
  country?: string;
};
