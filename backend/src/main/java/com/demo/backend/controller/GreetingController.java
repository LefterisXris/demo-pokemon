package com.demo.backend.controller;

import com.demo.backend.dto.GreetingResponse;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GreetingController {

    private static final List<String> NAMES = List.of(
            "Alice", "Bob", "Charlie", "Diana", "Eve",
            "Frank", "Grace", "Henry", "Ivy", "Jack"
    );

    private final Random random = new Random();

    @GetMapping("/greeting")
    public GreetingResponse getGreeting() {
        String randomName = NAMES.get(random.nextInt(NAMES.size()));
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        return new GreetingResponse(randomName, timestamp);
    }
}
