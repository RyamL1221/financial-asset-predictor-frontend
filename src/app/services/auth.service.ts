import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ENDPOINTS } from './endpoints';

// Login interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

// Register interfaces
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Authenticates a user with email and password
   * Returns login response with message and token
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = `${this.baseUrl}/${ENDPOINTS.LOGIN}`;
    return this.http.post<LoginResponse>(url, credentials);
  }

  /**
   * Registers a new user with email, password, and optional name
   * Returns register response with message and token
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    const url = `${this.baseUrl}/${ENDPOINTS.REGISTER}`;
    return this.http.post<RegisterResponse>(url, userData);
  }
} 