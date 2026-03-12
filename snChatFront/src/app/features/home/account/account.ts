import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountModel } from '../../../shared/models/account-model';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { Utils } from '../../../shared/services/utils.service';

@Component({
  selector: 'app-account',
  imports: [FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {
  userAccount!: AccountModel;
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private authService: AuthenticationService,
    private cdr: ChangeDetectorRef,
    private utils: Utils,
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (res: AccountModel) => {
        this.userAccount = res;
        // Format the date to yyyy-MM-dd for the input[type="date"]
        if (this.userAccount.createdAt) {
          const date = new Date(this.userAccount.createdAt);
          this.userAccount.createdAt = date.toISOString().split('T')[0];
        }
        this.cdr.markForCheck();
        console.log(res);
      },
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Update the preview
        this.userAccount.profilePicUrl = e.target.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.authService.uploadProfilePic(this.selectedFile).subscribe({
      next: (res: any) => {
        console.log('Profile picture uploaded successfully', res);
        this.isUploading = false;
        this.selectedFile = null; // Reset state
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to upload profile picture', err);
        this.utils.error('Failed to upload profile pictur', err);
        this.isUploading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
