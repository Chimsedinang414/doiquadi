package com.localfood.repository;

import com.localfood.model.AuthProvider;
import com.localfood.model.OAuthAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OAuthAccountRepository extends JpaRepository<OAuthAccount, Long> {
    Optional<OAuthAccount> findByProviderAndProviderSubject(AuthProvider provider, String providerSubject);
    List<OAuthAccount> findAllByUserId(String userId);
    boolean existsByUserIdAndProvider(String userId, AuthProvider provider);
}
