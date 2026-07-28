package com.localfood.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @UuidGenerator
    @Column(length = 36, updatable = false, nullable = false)
    private String id;

    /** Public authentication subject; deliberately different from the database ID. */
    @Column(name = "auth_subject", length = 36, nullable = false, unique = true, updatable = false)
    private String authSubject;

    @Column(name = "username", length = 50, nullable = false, unique = true)
    private String userName;

    @Column(length = 254, nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 32, nullable = false)
    @Builder.Default
    private Set<Role> roles = new HashSet<>(Set.of(Role.USER));

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(name = "credentials_version", nullable = false)
    @Builder.Default
    private int credentialsVersion = 0;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "avatar_url", length = 500)
    private String avatar;

    @Column(length = 255)
    private String address;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void initializeAuthenticationSubject() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (authSubject == null) {
            authSubject = UUID.randomUUID().toString();
        }
        if (roles == null || roles.isEmpty()) {
            roles = new HashSet<>(Set.of(Role.USER));
        }
    }
}
