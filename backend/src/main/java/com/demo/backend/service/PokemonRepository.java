package com.demo.backend.service;

import com.demo.backend.dto.Pokemon;
import com.demo.backend.repository.PokemonJpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PokemonRepository {

    private final PokemonJpaRepository pokemonJpaRepository;

    public PokemonRepository(PokemonJpaRepository pokemonJpaRepository) {
        this.pokemonJpaRepository = pokemonJpaRepository;
    }

    public List<Pokemon> getAllPokemons() {
        return pokemonJpaRepository.findAll();
    }

    public Pokemon createPokemon(Pokemon pokemon) {
        pokemon.setId(null);
        return pokemonJpaRepository.save(pokemon);
    }

    public Pokemon updatePokemon(Pokemon pokemon) {
        return pokemonJpaRepository.save(pokemon);
    }

    public void deletePokemon(Long id) {
        pokemonJpaRepository.deleteById(id);
    }
}
