import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  constructor(private toast: MessageService) {}

  success(summary: string, detail: string, life = 3000) {
    this.toast.add({ severity: 'success', summary, detail, life, closable: true });
  }

  info(summary: string, detail: string, life = 3000) {
    this.toast.add({ severity: 'info', summary, detail, life, closable: true });
  }

  warn(summary: string, detail: string, life = 3000) {
    this.toast.add({ severity: 'warn', summary, detail, life, closable: true });
  }

  error(summary: string, detail: string, life = 3000) {
    this.toast.add({ severity: 'error', summary, detail, life, closable: true });
  }
}
