package com.demo.backend.controller;

import com.demo.backend.dto.Pokemon;
import com.demo.backend.service.PokemonRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PokemonController {

    private final PokemonRepository pokemonRepository;

    public PokemonController(PokemonRepository pokemonRepository) {
        this.pokemonRepository = pokemonRepository;
    }

    @GetMapping("/pokemons")
    public List<Pokemon> getAllPokemons() {
        return pokemonRepository.getAllPokemons();
    }

    @PostMapping("/pokemons")
    public Pokemon createPokemon(@RequestBody Pokemon pokemon) {
        return pokemonRepository.createPokemon(pokemon);
    }

    @PutMapping("/pokemons/{id}")
    public Pokemon updatePokemon(@PathVariable Long id, @RequestBody Pokemon pokemon) {
        pokemon.setId(id);
        return pokemonRepository.updatePokemon(pokemon);
    }

    @DeleteMapping("/pokemons/{id}")
    public void deletePokemon(@PathVariable Long id) {
        pokemonRepository.deletePokemon(id);
    }
}
