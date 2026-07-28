package com.localfood.repository;

import com.localfood.model.OAuthLinkIntent;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface OAuthLinkIntentRepository extends JpaRepository<OAuthLinkIntent, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<OAuthLinkIntent> findByTokenHash(String tokenHash);
}
