import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './auth.service';
import { StockTickerService, StockTickerResponse } from './stock-ticker.service';

/**
 * Main API Service - Web-facing facade that provides access to all API endpoints
 * This service acts as a central point for all API interactions
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private authService: AuthService,
    private stockTickerService: StockTickerService
  ) {}

  // Authentication methods
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.authService.login(credentials);
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.authService.register(userData);
  }

  // Stock ticker methods
  getStockTicker(ticker: string): Observable<StockTickerResponse> {
    return this.stockTickerService.getStockTicker(ticker);
  }
}
