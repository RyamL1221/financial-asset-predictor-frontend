import { Component } from '@angular/core';
import {FormsModule, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
      username: string = "";
      password: string = "";

      onSubmit() {

      }
}
