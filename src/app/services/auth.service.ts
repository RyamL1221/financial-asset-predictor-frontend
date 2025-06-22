import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ENDPOINTS } from './endpoints';
import { RegisterRequest, RegisterResponse } from './types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Registers a new user with email and password
   * @param registerData - User registration data including email, password, and confirmPassword
   * @returns Observable with registration response
   */
  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    const url = `${this.baseUrl}/${ENDPOINTS.REGISTER}`;
    return this.http.post<RegisterResponse>(url, registerData);
  }
} 