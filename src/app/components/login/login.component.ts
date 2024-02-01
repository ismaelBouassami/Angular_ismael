import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private usersService: UsersService, private router: Router) { }
  mode: string = 'login';
  
  @Input()
  set setmode(value: string) {
    this.mode = value;
    if(value ==='logout'){
      this.usersService.logout();
      this.router.navigate(['userManagement','login']);
    }
  }

  email: string = '';
  password: string = '';
  repeatPassword: string = '';
  error: string = '';
  firstName: string = ''; 
  lastName: string = '';

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    repeatPassword: new FormControl('') 
  });
  async login() {
    console.log(this.mode);
    
    if(this.mode === 'register' &&this.password.length<6){
      this.error = 'Min: caracters 6';
      return;
    }
    if (this.mode === 'register' && this.password !== this.repeatPassword) {
      this.error = 'Passwords do not match';
      return;
    } 
   
    if (this.mode === 'login') {
      console.log("Entra a login");
      
      let logged = await this.usersService.login(this.email, this.password);
      if (logged) {
        this.router.navigate(['favorites']);
      } else {
        this.error = 'Bad Email or Password';
      }
    } else if (this.mode === 'register') {
      console.log("modo registro")
      try {
        await this.usersService.register(this.firstName, this.lastName, this.email, this.password);
        this.router.navigate(['userManagement/login']);
       // this.router.navigate(['favorites']);
      } catch (error) {
        // Manejar errores de registro
        this.error = 'Error during registration';
      }
  }



}}
