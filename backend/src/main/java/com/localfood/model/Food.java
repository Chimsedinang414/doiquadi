package com.localfood.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "foods")
@Getter
@Setter
@NoArgsConstructor
public class Food {
    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "image_url", length = 500)
    private String imageUrl;
}
