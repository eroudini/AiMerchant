// Global shared types for AIMerchant front-end
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  plan?: string;
  createdAt?: string;
}

export interface KPIData {
  revenue30d: number;
  orders30d: number;
  marginPct: number;
  alertsCount: number;
}

export interface AlertItem {
  type: string;
  text: string;
  createdAt: string;
}

export interface InsightAction {
  label: string;
  href: string;
}
export interface InsightItem {
  title: string;
  detail: string;
  action?: InsightAction;
}

export interface AuthResponseLogin {
  user: User;
  accessToken: string;
}

export interface AuthResponseRegister {
  user: User;
  requiresEmailVerification: boolean;
}

export type Nullable<T> = T | null;
