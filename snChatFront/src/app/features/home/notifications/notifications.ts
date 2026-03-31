import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatListService } from '../../../shared/services/chat-list.service';
import { Utils } from '../../../shared/services/utils.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  friendRequests: any[] = [];
  unreadMessages: any[] = [];
  loading: boolean = true;

  constructor(
    private chatListService: ChatListService,
    private utils: Utils,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.loading = true;
    this.chatListService.getNotifications().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.friendRequests = res.friendRequests;
          this.unreadMessages = res.unreadMessages;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
        this.utils.error('Error', 'Failed to load notifications');
        this.loading = false;
      },
    });
  }

  acceptRequest(requestId: string): void {
    this.chatListService.acceptFriendRequest(requestId).subscribe({
      next: (res: any) => {
        this.utils.success('Success', 'Friend request accepted');
        this.friendRequests = this.friendRequests.filter((r) => r._id !== requestId);
      },
      error: (err) => {
        this.utils.error('Error', err.error?.message || 'Failed to accept request');
      },
    });
  }

  rejectRequest(requestId: string): void {
    this.chatListService.rejectFriendRequest(requestId).subscribe({
      next: (res: any) => {
        this.utils.success('Info', 'Friend request rejected');
        this.friendRequests = this.friendRequests.filter((r) => r._id !== requestId);
      },
      error: (err) => {
        this.utils.error('Error', err.error?.message || 'Failed to reject request');
      },
    });
  }

  goToChat(roomId: string): void {
    this.chatListService.markAsRead(roomId).subscribe({
      next: () => {
        this.router.navigate(['/features/home/chat-list'], { queryParams: { room: roomId } });
      },
      error: (err) => {
        console.error('Error marking as read:', err);
        this.router.navigate(['/features/home/chat-list'], { queryParams: { room: roomId } });
      }
    });
  }
}
