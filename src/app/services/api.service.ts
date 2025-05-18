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

export interface StockTickerResponse {
  ticker: string;
  macd:   MacdEntry[];
  rsi:    RsiEntry[];
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
   * Fetches MACD and RSI data for the given ticker.
   */
  getStockTicker(ticker: string): Observable<StockTickerResponse> {
    const url = `${this.baseUrl}/${ENDPOINTS.GET_STOCK_TICKER}/${ticker}`;
    return this.http.get<StockTickerResponse>(url);
  }
}
