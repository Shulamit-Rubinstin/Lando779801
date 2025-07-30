import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SignatureComponent} from './signature/signature.component'
import { FormComponent } from './form/form.component';
import { SuccessMessageComponent } from './success-message/success-message.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,SignatureComponent,FormComponent,SuccessMessageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'LandoKosher';
}
