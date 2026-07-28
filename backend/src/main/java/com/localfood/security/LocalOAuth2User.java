package com.localfood.security;

import com.localfood.model.AuthProvider;
import com.localfood.model.Role;
import com.localfood.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class LocalOAuth2User implements OAuth2User, LocalOAuthPrincipal {
    private final OAuth2User delegate;
    private final User user;
    private final AuthProvider provider;
    private final boolean accountLinking;

    public LocalOAuth2User(
            OAuth2User delegate,
            User user,
            AuthProvider provider,
            boolean accountLinking
    ) {
        this.delegate = delegate;
        this.user = user;
        this.provider = provider;
        this.accountLinking = accountLinking;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getRoles().stream()
                .map(Role::name)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
    }

    @Override
    public String getName() {
        return user.getAuthSubject();
    }

    @Override
    public User getLocalUser() {
        return user;
    }

    @Override
    public AuthProvider getProvider() {
        return provider;
    }

    @Override
    public boolean isAccountLinking() {
        return accountLinking;
    }
}
