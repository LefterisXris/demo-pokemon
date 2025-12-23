import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GreetingResponse {
  name: string;
  timestamp: string;
}

export interface Pokemon {
  id: number;
  name: string;
  explanation: string;
  strength: number;
  powers: string[];
  picture: string;
  tips: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GreetingService {
  private greetingUrl = '/api/greeting';
  private pokemonUrl = '/api/pokemons';

  constructor(private http: HttpClient) { }

  getGreeting(): Observable<GreetingResponse> {
    return this.http.get<GreetingResponse>(this.greetingUrl);
  }

  getPokemons(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(this.pokemonUrl);
  }

  createPokemon(pokemon: Partial<Pokemon>): Observable<Pokemon> {
    return this.http.post<Pokemon>(this.pokemonUrl, pokemon);
  }

  updatePokemon(id: number, pokemon: Partial<Pokemon>): Observable<Pokemon> {
    return this.http.put<Pokemon>(`${this.pokemonUrl}/${id}`, pokemon);
  }

  deletePokemon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.pokemonUrl}/${id}`);
  }
}
