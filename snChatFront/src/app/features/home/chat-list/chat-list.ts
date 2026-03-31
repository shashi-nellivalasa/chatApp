import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Conversation } from '../conversation/conversation';
import { ChatListService } from '../../../shared/services/chat-list.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';

@Component({
  selector: 'app-chat-list',
  imports: [FormsModule, Conversation],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.css',
})
export class ChatList {
  chatlist: any[] = []; // Changed to any[] to accommodate the real structure
  search: string = '';
  selectedChat: any = null;
  currentUserId: string = '';

  constructor(
    private chatListService: ChatListService,
    private cdr: ChangeDetectorRef,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // 1. Get current user so we know who the "other" participant is
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        if (user && user._id) {
          this.currentUserId = user._id;
          this.loadRooms();
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to get current user:', err);
        this.cdr.markForCheck();
      },
    });
  }

  loadRooms() {
    this.chatListService.getChatList().subscribe({
      next: (res: any) => {
        if (res.success && res.rooms) {
          this.chatlist = res.rooms.map((room: any) => {
            // Find the explicitly *other* user in the participants array
            const otherUser = room.participants.find((p: any) => p._id !== this.currentUserId);
            return {
              roomId: room._id,
              name: otherUser ? otherUser.userName : 'Unknown User',
              lastMessage: room.lastMessage || 'No messages yet',
              image: otherUser?.profilePicUrl || '',
              status: otherUser?.status || 'offline',
            };
          });

          // If there's a roomId in query params, auto-select it
          const roomId = this.route.snapshot.queryParamMap.get('room');
          if (roomId) {
            const index = this.chatlist.findIndex((c) => c.roomId === roomId);
            if (index !== -1) {
              this.selectChat(index);
            }
          }

          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Failed to fetch rooms', err);
        this.cdr.markForCheck();
      },
    });
  }

  selectChat(index: number) {
    this.selectedChat = this.chatlist[index]; // Pass the whole object
    console.log('Selected Chat:', this.selectedChat);
  }
}
