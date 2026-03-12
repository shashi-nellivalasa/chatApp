import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  constructor(private httpClient: HttpClient) {}

  /**
   * Sign up a new user
   * @param signUpData User signup credentials
   * @returns Observable of SignUpResponse
   */
  signUp(signUpData: SignUpRequest): Observable<SignUpResponse> {
    return this.httpClient.post<SignUpResponse>(`${this.apiUrl}/auth/signUp`, signUpData);
  }

  /**
   * Sign in an existing user
   * @param signInData User login credentials
   * @returns Observable of SignInResponse
   */
  signIn(signInData: SignInRequest): Observable<SignInResponse> {
    return this.httpClient.post<SignInResponse>(`${this.apiUrl}/auth/signIn`, signInData);
  }

  /**
   * Sign out the current user
   * @returns Observable of signout response
   */
  signOut(): Observable<any> {
    const token = localStorage.getItem('accountToken');
    const headers = new HttpHeaders({
      token: token || '',
    });
    return this.httpClient.post(`${this.apiUrl}/auth/signOut`, {}, { headers });
  }

  /**
   * Get current user info (requires authentication)
   * @returns Observable of user data
   */
  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('accountToken');
    const headers = new HttpHeaders({
      token: token || '',
    });
    return this.httpClient.get(`${this.apiUrl}/auth/me`, { headers });
  }

  /**
   * Upload user profile picture
   * @param file The image file to upload
   * @returns Observable of the upload response containing the new image URL
   */
  uploadProfilePic(file: File): Observable<any> {
    const token = localStorage.getItem('accountToken');
    const headers = new HttpHeaders({
      token: token || '',
    });

    const formData = new FormData();
    formData.append('profilePic', file);

    return this.httpClient.post(`${this.apiUrl}/auth/uploadProfilePic`, formData, { headers });
  }

  /**
   * Fetch all users
   * @returns Observable of users
   */
  getUsers(): Observable<any> {
    const token = localStorage.getItem('accountToken');
    const headers = new HttpHeaders({
      token: token || '',
    });
    return this.httpClient.get(`${this.apiUrl}/auth/`, { headers });
  }
}
