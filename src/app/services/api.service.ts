import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ENDPOINTS } from './endpoints';

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
   */
  getStockTicker(ticker: string): Observable<StockTickerResponse> {
    const url = `${this.baseUrl}/${ENDPOINTS.GET_STOCK_TICKER}/${ticker}`;
    return this.http.get<StockTickerResponse>(url);
  }
}
