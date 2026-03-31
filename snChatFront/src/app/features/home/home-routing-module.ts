import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home';
import { Account } from './account/account';
import { ChatList } from './chat-list/chat-list';
import { Search } from './search/search';
import { SavedChats } from './saved-chats/saved-chats';
import { Notifications } from './notifications/notifications';

const routes: Routes = [
  {
    path: '',
    component: Home,
    children: [
      { path: '', redirectTo: 'chat-list', pathMatch: 'full' },
      { path: 'chat-list', component: ChatList },
      { path: 'account', component: Account },
      { path: 'search', component: Search },
      { path: 'savedChats', component: SavedChats },
      { path: 'notifications', component: Notifications },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
