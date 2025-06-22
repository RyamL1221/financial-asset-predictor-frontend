// Stock Analysis Types
export interface MacdEntry {
  histogram: number;
  signal:    number;
  timestamp: number;
  value:     number;
}

export interface RsiEntry {
  timestamp: number;
  value:     number;
}

export interface BetaEntry {
  beta: string;
  datetime: string;
}

export interface BollingerBandsEntry {
  datetime: string;
  lower_band: string;
  middle_band: string;
  upper_band: string;
}

export interface EpsData {
  '30daysAgo': EpsPeriod;
  '60daysAgo': EpsPeriod;
  '7daysAgo': EpsPeriod;
  '90daysAgo': EpsPeriod;
  current: EpsPeriod;
}

export interface EpsPeriod {
  '+1q': number;
  '+1y': number;
  '0q': number;
  '0y': number;
}

export interface StockTickerResponse {
  ticker: string;
  macd:   MacdEntry[];
  rsi:    RsiEntry[];
  beta:   BetaEntry[];
  bollinger_bands: BollingerBandsEntry[];
  eps:    EpsData;
  roic:   number;
  ey:     number;
  country: string;
  name:    string;
  shareOutstanding: number;
  weburl: string;
}

// Authentication Types
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
  token?: string;
} 