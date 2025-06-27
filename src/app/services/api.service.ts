import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ENDPOINTS } from './endpoints';
import { RecommendationScale, CurrentRecommendation, EpsAnalysis, TechnicalAnalysis, AnalysisData } from '../types/recommendation-scale.types';

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

export interface CompanyProfile {
  country: string;
  currency: string;
  estimateCurrency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface StockTickerResponse {
  analysis: AnalysisData;
  beta: BetaEntry[];
  bollinger_bands: BollingerBandsEntry[];
  eps: EpsData;
  ey: number;
  macd: MacdEntry[];
  profile: CompanyProfile;
  roic: number;
  rsi: RsiEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Fetches comprehensive stock data for the given ticker including:
   * - MACD and RSI indicators
   * - Beta values
   * - Bollinger Bands
   * - EPS data
   * - ROIC and EY metrics
   * - Company profile information
   * - Comprehensive analysis and recommendations
   */
  getStockTicker(ticker: string): Observable<StockTickerResponse> {
    const url = `${this.baseUrl}/${ENDPOINTS.GET_STOCK_TICKER}/${ticker}`;
    return this.http.get<StockTickerResponse>(url);
  }
}
