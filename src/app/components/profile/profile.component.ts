import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { map } from 'rxjs';
import { IUser } from '../../interfaces/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {



  constructor(private formBuilder: FormBuilder, private userService: UsersService) { this.crearFormulario() }

  formulario!: FormGroup;
  enviarFormulario() {
    if (this.formulario.get('website')?.valid||this.formulario.get('username')?.valid) {
      const formData = this.formulario.value;
      
      console.log('Enviando formulario:', formData);

    } else {

      console.log('El formulario no es válido. Por favor, completa todos los campos obligatorios.');
    }
  }

  crearFormulario() {
    this.formulario = this.formBuilder.group({
      id: [''],
      username: ['', [Validators.required, Validators.minLength(5), Validators.pattern('.*[a-zA-Z].*')]],
      full_name: ['',[Validators.required]],
      avatar_url: ['',[Validators.required]],
      website: ['', Validators.compose([Validators.required, WebsiteValidator('http.*')])],
    })
  }
  cargarImagen(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar que el archivo seleccionado sea una imagen
      if (file.type.startsWith('image/')) {
        // Cargar la imagen seleccionada en el formulario como base64
        const reader = new FileReader();
        reader.onload = () => {
          this.formulario.patchValue({
            avatar_url: reader.result
          });
        };
        reader.readAsDataURL(file);
      } else {
        // Si el archivo seleccionado no es una imagen, mostrar un mensaje de error o tomar otra acción
        console.error('El archivo seleccionado no es una imagen.');
      }
    }
  }
  
  get usernameNotValid() {
    return this.formulario.get('username')!.invalid ;
  }

  get websiteNotValid(){
    return this.formulario.get('website')!.invalid ;
  }

  ngOnInit(): void {

    this.userService.isLogged();
    this.userService.userSubject
      .pipe(map((p: IUser) => {
        return {
          id: p.id,
          username: p.username,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          website: p.website
        }
      }))
      .subscribe(profile => this.formulario.setValue(profile))


  }
}


function enviarFormulario() {

}
function WebsiteValidator(pattern: string): ValidatorFn {
  return (c: AbstractControl): { [key: string]: any } | null => {
    if (c.value) {
      let regexp = new RegExp(pattern);
      return regexp.test(c.value) ? null : { website: c.value };

    }
    return null;
  };

}
