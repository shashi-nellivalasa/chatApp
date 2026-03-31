import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../shared/services/socket.service';
import { ChatListService } from '../../../shared/services/chat-list.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { Utils } from '../../../shared/services/utils.service';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './conversation.html',
  styleUrl: './conversation.css',
})
export class Conversation implements OnChanges, OnDestroy, AfterViewChecked {
  @Input()
  selectedChat: any = null; // Changed to any to get the object properties like roomId and name

  @ViewChild('messagesArea') private messagesArea!: ElementRef;

  newMessage: string = '';
  messages: any[] = [];
  currentUserId: string = '';
  private messageSubscription!: Subscription;
  private shouldScroll = false;

  constructor(
    private socketService: SocketService,
    private chatListService: ChatListService,
    private authService: AuthenticationService,
    private utils: Utils, // Added for success/error messages
    private cdr: ChangeDetectorRef,
  ) {}

  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  selectedMessageForMenu: any = null;

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        if (user && user._id) {
          this.currentUserId = user._id;
        }
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedChat'] && this.selectedChat && this.selectedChat.roomId) {
      const roomId = this.selectedChat.roomId;
      this.socketService.joinRoom(roomId);
      this.messages = []; // Clear current messages while loading

      // Fetch message history
      this.chatListService.getMessages(roomId).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.messages = res.messages;
            this.shouldScroll = true;
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('Error fetching messages: ', err);
        },
      });

      // Listen for socket messages
      if (!this.messageSubscription) {
        this.messageSubscription = this.socketService.receiveMessages().subscribe((msg) => {
          if (msg.roomId === this.selectedChat.roomId && msg.sender._id !== this.currentUserId) {
            this.messages.push(msg);
            this.shouldScroll = true;
            this.cdr.markForCheck();
          }
        });
      }
    }
  }

  sendMessage() {
    if (this.newMessage.trim() === '' || !this.selectedChat?.roomId || !this.currentUserId) {
      return;
    }

    const content = this.newMessage;
    const roomId = this.selectedChat.roomId;

    this.chatListService.sendMessage(roomId, content).subscribe({
      next: (res: any) => {
        if (res.success && res.message) {
          // Push securely tracked message to local list
          this.messages.push(res.message);

          // Emit socket so the other person receives it instantly
          // The other user's app receives this data through the `receiveMessages` event
          this.socketService.sendMessage(roomId, res.message);

          this.newMessage = '';
          this.shouldScroll = true;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Failed to send message:', err);
      },
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesArea?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch (e) {}
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  onRightClick(event: MouseEvent, message: any) {
    event.preventDefault();
    this.selectedMessageForMenu = message;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.showContextMenu = true;
  }

  saveMsg() {
    if (!this.selectedMessageForMenu) return;

    this.chatListService.saveMessage(this.selectedMessageForMenu._id).subscribe({
      next: (res: any) => {
        this.utils.success('Success', res.message || 'Message saved');
        this.closeContextMenu();
      },
      error: (err) => {
        this.utils.error('Error', err.error?.message || 'Failed to save message');
        this.closeContextMenu();
      },
    });
  }

  @HostListener('document:click')
  closeContextMenu() {
    this.showContextMenu = false;
    this.selectedMessageForMenu = null;
  }
}
