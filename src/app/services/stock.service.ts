import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ENDPOINTS } from './endpoints';
import { StockTickerResponse } from './types';

@Injectable({
  providedIn: 'root'
})
export class StockService {
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
   * @param ticker - Stock ticker symbol
   * @returns Observable with comprehensive stock data
   */
  getStockTicker(ticker: string): Observable<StockTickerResponse> {
    const url = `${this.baseUrl}/${ENDPOINTS.GET_STOCK_TICKER}/${ticker}`;
    return this.http.get<StockTickerResponse>(url);
  }
} 