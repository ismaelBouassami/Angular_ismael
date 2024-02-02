import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { Observable, Subject, from, tap } from 'rxjs';
import { IUser } from '../interfaces/user';
import { environments } from '../../environments/environments';

const emptyUser: IUser = {
  id: '0',
  avatar_url: 'none',
  full_name: 'none',
  username: 'none',
  website: 'none',
};

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  supaClient: any = null;

  constructor() {
    this.supaClient = createClient(
      environments.supabaseUrl,
      environments.supabaseKey
    );
  }

  userSubject: Subject<IUser> = new Subject();
  favoritesSubject: Subject<{ id: number; uid: string; artwork_id: string }[]> =
    new Subject();

  async login(email: string, password: string): Promise<boolean> {
    let session = await this.supaClient.auth.getSession();
    let data, error;

    console.log(session);

    if (session.data.session) {
      data = session.data.session;
    } else {
      session = await this.supaClient.auth.signInWithPassword({
        email,
        password,
      });
      data = session.data;
      error = session.error;
      if (error) {
        throw error;
      }
    }

    if (data.user != null) {
      this.getProfile(data.user.id);
      return true;
    }
    return false;
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supaClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Error registering user:', error);
        return false;
      }

      if (data?.user != null) {
        const defaultAvatarUrl = '../assets/logo.svg';
        //this.createProfile(data.user.id, firstName, lastName);
        console.log(firstName + '----' + lastName + '----' + defaultAvatarUrl);

        if (data?.user != null) {
          const { error: profileError } = await this.supaClient
            .from('profiles')
            .update({
              username: firstName,
              full_name: lastName,
              avatar_url: defaultAvatarUrl,
            })
            .eq('id', data.user.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
            return false;
          }
          return true;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  }

  async createProfile(
    userId: string,
    firstName: string,
    lastName: string
  ): Promise<void> {
    try {
      const defaultAvatarUrl = '../assets/logo.svg';
      const { data, error } = await this.supaClient
        .from('profiles')
        .insert([
          {
            id: userId,
            username: firstName,
            full_name: lastName,
            avatar_url: defaultAvatarUrl,
          },
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

  getProfile(userId: string): void {
    let profilePromise: Promise<{ data: IUser[] }> = this.supaClient
      .from('profiles')
      .select('*')
      // Filters
      .eq('id', userId);

    from(profilePromise)
      .pipe(tap((data) => console.log(data)))
      .subscribe(async (profile: { data: IUser[] }) => {
        this.userSubject.next(profile.data[0]);
        const avatarFile = profile.data[0].avatar_url.split('/').at(-1);
        const { data, error } = await this.supaClient.storage
          .from('avatars')
          .download(avatarFile);
        const url = URL.createObjectURL(data);
        profile.data[0].avatar_url = url;
        this.userSubject.next(profile.data[0]);
      });
  }

  async isLogged() {
    let { data, error } = await this.supaClient.auth.getSession();
    if (data.session) {
      this.getProfile(data.session.user.id);
    }
  }

  async logout() {
    const { error } = await this.supaClient.auth.signOut();
    this.userSubject.next(emptyUser);
  }

  getFavorites(uid: string): void {
    let promiseFavorites: Promise<{
      data: { id: number; uid: string; artwork_id: string }[];
    }> = this.supaClient.from('Favorites').select('*').eq('uid', uid);

    promiseFavorites.then((data) => this.favoritesSubject.next(data.data));

  }

  async getArtworkIdsByUid(uid: string): Promise<string[]> {
    try {
      const { data, error } = await this.supaClient
        .from('Favorites')
        .select('artwork_id')
        .eq('uid', uid);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        return data.map((item: any) => item.artwork_id);
      } else {
        return []; // Retorna un array vacío si no se encontraron registros
      }
    } catch (error) {
      console.error('Error al obtener los artwork_id:', error);
      throw error;
    }
  }
  async getUid(): Promise<string> {
    try {
      const { data, error } = await this.supaClient.auth.getSession();

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error('No session available');
      }

      return data.session.user.id;
    } catch (error) {
      console.error('Error al obtener el UID:', error);
      throw error;
    }
  }
  async setFavorite(artwork_id: string): Promise<any> {
    console.log('setfavorite', artwork_id);

    let { data, error } = await this.supaClient.auth.getSession();
    console.log(data);
    if (data.session === null) {
      alert('Login First');// si estamos logueados o no
      return;
    }
    // Verificar si ya existe una fila con el mismo uid y artwork_id
    const existingFavorite = await this.supaClient
      .from('Favorites')
      .select('*')
      .eq('uid', data.session.user.id)
      .eq('artwork_id', artwork_id)
      ;
    console.log(existingFavorite.data.length);
    
    if (existingFavorite.data.length!=0) {
      
      console.log('Ya existe una fila con el mismo uid y artwork_id, no se hará nada.');
      return;
    }
    let promiseFavorites: Promise<boolean> = this.supaClient
      .from('Favorites')
      .insert({ uid: data.session.user.id, artwork_id: artwork_id });

    console.log('Entra a  subir a favorites');

    promiseFavorites.then(() => this.getFavorites(data.session.user.id));
  }

  async deleteFavorite(artwork_id: string): Promise<any> {
    console.log('deleteFavorite', artwork_id);

    let { data, error } = await this.supaClient.auth.getSession();
    console.log(data);

    if (!data.session) {
      alert('Login First');
      return;
    }

    let promiseDelete: Promise<boolean> = this.supaClient
      .from('Favorites')
      .delete()
      .eq('uid', data.session.user.id)
      .eq('artwork_id', artwork_id)
      .single();

    console.log('Entra a eliminar de favorites');

    promiseDelete.then(() => this.getFavorites(data.session.user.id));


  }
}
