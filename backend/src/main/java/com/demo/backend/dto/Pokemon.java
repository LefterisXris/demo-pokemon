package com.demo.backend.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pokemon")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pokemon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String explanation;

    @Column(nullable = false)
    private Integer strength;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pokemon_powers", joinColumns = @JoinColumn(name = "pokemon_id"))
    @Column(name = "power")
    private List<String> powers = new ArrayList<>();

    @Column(length = 500)
    private String picture;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pokemon_tips", joinColumns = @JoinColumn(name = "pokemon_id"))
    @Column(name = "tip")
    private List<String> tips = new ArrayList<>();
}
