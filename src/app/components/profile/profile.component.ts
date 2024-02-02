import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { map } from 'rxjs';
import { IUser } from '../../interfaces/user';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {



  constructor(private formBuilder: FormBuilder, private userService: UsersService,private http: HttpClient) { this.crearFormulario() }

  formulario!: FormGroup;
  avatarFile: File | null = null;
  enviarFormulario() {
   
    console.log(this.formulario.value);
   
    if (this.formulario.valid) {
      console.log(this.avatarFile,'avatar file del archivo locureta tt');
      
      if (this.avatarFile) {
        this.userService.subirImagenASupabase(this.avatarFile);
      }
      
          const profileData = this.formulario.value;
          this.userService.updateProfile(profileData)
            .then(() => {
              console.log('Perfil actualizado correctamente');
              // location.reload();
            })
            .catch(error => {
              console.error('Error al actualizar el perfil:', error);
              
            });
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
    this.avatarFile = event.target.files[0];
    // if (this.avatarFile) {
      
    //     const imageUrl = URL.createObjectURL(file); 
    //     console.log('Ruta absoluta del archivo:', imageUrl);
        
        
    // }
    
    if (this.avatarFile) {
   
      if (this.avatarFile.type.startsWith('image/')) {
       
        const reader = new FileReader();
        reader.onload = () => {
          this.formulario.patchValue({
            avatar_url: reader.result
            
          });
          
          
        };
        reader.readAsDataURL(this.avatarFile);


      } else {
       
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


// enviarFormulario(formularios: FormGroup) {
//   if (this.formularios.valid) {
//     const profileData = formularios.value;
//     this.userService.updateProfile(profileData)
//       .then(() => {
//         console.log('Perfil actualizado correctamente');
//         // Realiza cualquier otra acción necesaria después de actualizar el perfil
//       })
//       .catch(error => {
//         console.error('Error al actualizar el perfil:', error);
//         // Maneja el error según tus necesidades
//       });
//   }
// }

function WebsiteValidator(pattern: string): ValidatorFn {
  return (c: AbstractControl): { [key: string]: any } | null => {
    if (c.value) {
      let regexp = new RegExp(pattern);
      return regexp.test(c.value) ? null : { website: c.value };

    }
    return null;
  };

}
