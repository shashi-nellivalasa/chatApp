import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  SignInResponse,
} from '../models/auth-models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private apiUrl = environment.apiUrl; // Change to your backend URL

  constructor(private httpClient: HttpClient) { }

  /**
   * Sign up a new user
   * @param signUpData User signup credentials
   * @returns Observable of SignUpResponse
   */
  signUp(signUpData: SignUpRequest): Observable<SignUpResponse> {
    return this.httpClient.post<SignUpResponse>(`${this.apiUrl}/signUp`, signUpData);
  }

  /**
   * Sign in an existing user
   * @param signInData User login credentials
   * @returns Observable of SignInResponse
   */
  signIn(signInData: SignInRequest): Observable<SignInResponse> {
    return this.httpClient.post<SignInResponse>(`${this.apiUrl}/signIn`, signInData);
  }

  /**
   * Log out the current user
   * @returns Observable of logout response
   */
  logout(): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/logout`, {});
  }

  /**
   * Get current user info (requires authentication)
   * @returns Observable of user data
   */
  getCurrentUser(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/me`);
  }
}
