import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatListService } from '../../../shared/services/chat-list.service';
import { Utils } from '../../../shared/services/utils.service';

@Component({
  selector: 'app-saved-chats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-chats.html',
  styleUrl: './saved-chats.css',
})
export class SavedChats implements OnInit {
  savedMessages: any[] = [];
  loading: boolean = true;

  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  selectedMessageForMenu: any = null;

  constructor(
    private chatListService: ChatListService,
    private utils: Utils,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchSavedMessages();
  }

  fetchSavedMessages(): void {
    this.loading = true;
    this.chatListService.getSavedMessages().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.savedMessages = res.saved;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching saved messages:', err);
        this.utils.error('Error', 'Failed to load saved messages');
        this.loading = false;
      },
    });
  }

  onRightClick(event: MouseEvent, savedItem: any) {
    event.preventDefault();
    this.selectedMessageForMenu = savedItem.message;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.showContextMenu = true;
  }

  goToChat() {
    if (!this.selectedMessageForMenu || !this.selectedMessageForMenu.room) return;

    const roomId = this.selectedMessageForMenu.room;
    // Navigate to chat-list and pass the roomId as a query param or state
    // The ChatList component should handle opening the specific room
    this.router.navigate(['/features/home/chat-list'], { queryParams: { room: roomId } });
    this.closeContextMenu();
  }

  @HostListener('document:click')
  closeContextMenu() {
    this.showContextMenu = false;
    this.selectedMessageForMenu = null;
  }
}
