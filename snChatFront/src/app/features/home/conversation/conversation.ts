import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../shared/services/socket.service';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './conversation.html',
  styleUrl: './conversation.css',
})
export class Conversation implements OnChanges, OnDestroy {
  @Input()
  selectedChat: string = '';

  newMessage: string = '';
  messages: any[] = [];
  private messageSubscription!: Subscription;

  constructor(private socketService: SocketService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedChat'] && this.selectedChat) {
      this.socketService.joinRoom(this.selectedChat);
      this.messages = []; // Clear current messages

      if (!this.messageSubscription) {
        this.messageSubscription = this.socketService.receiveMessages().subscribe((msg) => {
          // ensure sender isn't duplicated if we already added it optimistically
          if (msg.sender !== 'Me') {
            this.messages.push(msg);
          }
        });
      }
    }
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedChat) {
      const msgData = {
        sender: 'Me',
        content: this.newMessage,
        timestamp: new Date(),
      };

      this.socketService.sendMessage(this.selectedChat, msgData);

      // Optimistically add to UI
      this.messages.push(msgData);
      this.newMessage = '';
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
