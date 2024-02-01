import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js'
import { Observable, Subject, from, tap } from 'rxjs';
import { IUser } from '../interfaces/user';
import { environment } from '../../environments/environmets';


const emptyUser: IUser = {id: '0', avatar_url: 'none', full_name: 'none', username: 'none', website:'none' }

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  supaClient: any = null;

  constructor() {
    this.supaClient = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  userSubject: Subject<IUser> = new Subject;
  favoritesSubject: Subject<{id:number,uid:string,artwork_id:string}[]> = new Subject;

  async login(email: string, password: string):Promise<boolean>{
        let session = await this.supaClient.auth.getSession();
        let data, error;

        console.log(session);

        if(session.data.session){
          data = session.data.session;
        }
        else{
          session = await this.supaClient.auth.signInWithPassword({
            email,
            password
          });
          data = session.data;
          error = session.error;
          if(error){
            throw error;
          }
        }

        if(data.user != null){
          this.getProfile(data.user.id);
          return true;
        }
      return false;
  }

  async register(firstName: string, lastName: string, email: string, password: string): Promise<boolean> {
    try {
      const { data, error } = await this.supaClient.auth.signUp({
        email,
        password,
        data: {
          first_name: firstName,
          last_name: lastName
        }
      });

      if (error) {
        console.error('Error registering user:', error);
        return false;
      }

      if (data?.user != null) {
   
        this.createProfile(data.user.id, firstName, lastName); 
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
}

async createProfile(userId: string, firstName: string, lastName: string): Promise<void> {
    try {
      const defaultAvatarUrl = '../assets/logo.svg';
        const { data, error } = await this.supaClient.from('profiles').insert([
            { id: userId, username: firstName, full_name: lastName,avatar_url: defaultAvatarUrl}
        ]);
        
        if (error) {
            console.error('Error creating profile:', error);
            throw error;
        }

        console.log('Profile created successfully:', data);
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
}


  getProfile(userId:string): void{

    let profilePromise: Promise<{data: IUser[]}> = this.supaClient
    .from('profiles')
    .select("*")
    // Filters
    .eq('id', userId);

    from(profilePromise).pipe(
      tap(data => console.log(data))
      ).subscribe(async (profile:{data: IUser[]}) =>{
        this.userSubject.next(profile.data[0]);
        const avatarFile = profile.data[0].avatar_url.split('/').at(-1);
        const { data, error } = await this.supaClient.storage.from('avatars').download(avatarFile);
        const url = URL.createObjectURL(data)
        profile.data[0].avatar_url = url;
        this.userSubject.next(profile.data[0]);
      }

      );

  }

  async isLogged(){
    let {data,error} = await this.supaClient.auth.getSession();
    if(data.session){
      this.getProfile(data.session.user.id)
    }
  }

  async logout(){
    const { error } = await this.supaClient.auth.signOut();
    this.userSubject.next(emptyUser);
  }

  getFavorites(uid:string):void{
    let promiseFavorites: Promise<{data: {id:number,uid:string,artwork_id:string}[]}> = this.supaClient
    .from('favorites')
    .select("*")
    .eq('uid', uid);

    promiseFavorites.then((data)=> this.favoritesSubject.next(data.data));
  }

  async setFavorite(artwork_id:string): Promise<any>{

    console.log('setfavorite', artwork_id);


    let {data,error} = await this.supaClient.auth.getSession();
    let promiseFavorites: Promise<boolean> = this.supaClient
    .from('favorites')
    .insert({uid: data.session.user.id, artwork_id});


    promiseFavorites.then(()=>this.getFavorites(data.session.user.id));
  }


}




/*
npm install @supabase/supabase-js

*/
