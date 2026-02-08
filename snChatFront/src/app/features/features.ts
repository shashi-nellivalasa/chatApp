import { Component } from '@angular/core';
import { AuthenticationRoutingModule } from "./authentication/authentication-routing-module";

@Component({
  selector: 'app-features',
  imports: [AuthenticationRoutingModule],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features {

}
