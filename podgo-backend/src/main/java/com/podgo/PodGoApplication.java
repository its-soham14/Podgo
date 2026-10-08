package com.podgo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PodGoApplication {

    public static void main(String[] args) {
        SpringApplication.run(PodGoApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner fixDbSchema(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE notifications MODIFY type VARCHAR(255)");
                System.out.println("Successfully altered notifications table type column to VARCHAR(255)!");
            } catch (Exception e) {
                System.out.println("Schema fix skipped or failed: " + e.getMessage());
            }
        };
    }
}