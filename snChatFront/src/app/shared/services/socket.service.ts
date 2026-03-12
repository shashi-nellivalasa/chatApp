import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.connectSocket();
    }
  }

  // Allow the app to reconnect with a fresh token dynamically (e.g. after login)
  connectSocket() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Disconnect existing socket first if we have one
    if (this.socket) {
      this.socket.disconnect();
    }

    const token = localStorage.getItem('accountToken') || '';
    this.socket = io(environment.apiUrl || 'http://localhost:3000', {
      withCredentials: true,
      auth: {
        token: token,
      },
    });
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  sendMessage(roomId: string, message: any) {
    if (this.socket) {
      this.socket.emit('send_message', { roomId, ...message });
    }
  }

  receiveMessages(): Observable<any> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('receive_message', (data) => {
          observer.next(data);
        });
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
