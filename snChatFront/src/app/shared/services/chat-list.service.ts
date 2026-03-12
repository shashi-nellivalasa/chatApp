import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatListService {
  private apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getChatList() {
    const token = localStorage.getItem('accountToken');
    const headers = { token: token || '' };
    return this.httpClient.get(`${this.apiUrl}/api/rooms`, { headers });
  }

  createRoom(participants: string[]) {
    // Add the token since chat routes are protected
    const token = localStorage.getItem('accountToken');
    const headers = { token: token || '' };
    return this.httpClient.post(`${this.apiUrl}/api/rooms`, { participants }, { headers });
  }

  getMessages(roomId: string) {
    const token = localStorage.getItem('accountToken');
    const headers = { token: token || '' };
    return this.httpClient.get(`${this.apiUrl}/api/rooms/${roomId}/messages`, { headers });
  }

  sendMessage(roomId: string, content: string) {
    const token = localStorage.getItem('accountToken');
    const headers = { token: token || '' };
    return this.httpClient.post(`${this.apiUrl}/api/rooms/${roomId}/messages`, { content }, { headers });
  }
}
