import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { usersModel } from '../../../shared/models/account-model';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { ChatListService } from '../../../shared/services/chat-list.service';
import { Utils } from '../../../shared/services/utils.service';
import { CommonModule } from '@angular/common'; // Need CommonModule if any directives are used, but we use @if so it's fine. Wait, Table might need it in app config.

@Component({
  selector: 'app-search',
  imports: [TableModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  inputValue: string = '';
  userList: usersModel[] = [];
  filteredUsers: usersModel[] = [];
  currentUserId: string = '';

  constructor(
    private authService: AuthenticationService,
    private cdr: ChangeDetectorRef,
    private chatListService: ChatListService,
    private utils: Utils,
  ) {}

  ngOnInit() {
    // First, get the current user to know their ID
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        if (user && user._id) {
          this.currentUserId = user._id;
        }
        this.fetchAllUsers();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching current user:', err);
        this.fetchAllUsers();
        this.cdr.markForCheck();
      },
    });
  }

  fetchAllUsers() {
    this.authService.getUsers().subscribe({
      next: (res: any) => {
        if (res.success && res.users) {
          // Filter out the current user from the list
          this.userList = res.users.filter((u: usersModel) => u._id !== this.currentUserId);
          this.filteredUsers = this.userList;
          console.log(res.users);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.cdr.markForCheck();
      },
    });
  }

  searchAccount(event: Event) {
    this.inputValue = (event.target as HTMLInputElement).value;

    // Filter logic
    if (this.inputValue.trim() === '') {
      this.filteredUsers = this.userList;
    } else {
      const lowerCaseQuery = this.inputValue.toLowerCase();
      this.filteredUsers = this.userList.filter(
        (user) =>
          user.userName.toLowerCase().includes(lowerCaseQuery) ||
          (user.firstName && user.firstName.toLowerCase().includes(lowerCaseQuery)),
      );
    }
  }

  addContact(event: Event, user: usersModel) {
    event.stopPropagation(); // Prevents row click (selectUser) from triggering

    if (!this.currentUserId) {
      this.utils.error('Error', 'Current user not identified. Please login again.');
      return;
    }

    const targetUserId = user._id;

    this.chatListService.createRoom([this.currentUserId, targetUserId]).subscribe({
      next: (res: any) => {
        console.log('Room created successfully', res);
        this.utils.success('Success', `Added ${user.userName}`);
        // Visually update the UI right away
        user.added = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to create room', err);
        this.utils.error('Error', 'Could not add the contact at this time.');
        this.cdr.markForCheck();
      },
    });
  }

  sendRequest(user: usersModel) {}
}
