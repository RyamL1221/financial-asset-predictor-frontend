import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../ui-components/navbar/navbar.component";

@Component({
    selector: 'app-home',
    imports: [FormsModule, NavbarComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {

}
