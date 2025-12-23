package com.demo.backend.repository;

import com.demo.backend.dto.Pokemon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PokemonJpaRepository extends JpaRepository<Pokemon, Long> {
}
