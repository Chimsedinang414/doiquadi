package com.localfood.controller;

import com.localfood.dto.AuthResponse;
import com.localfood.dto.LoginRequest;
import com.localfood.dto.OAuthExchangeRequest;
import com.localfood.dto.RefreshTokenRequest;
import com.localfood.dto.RegisterRequest;
import com.localfood.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authenticationService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authenticationService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authenticationService.refresh(request.refreshToken());
    }

    @PostMapping("/oauth2/exchange")
    public AuthResponse exchangeOAuthCode(@Valid @RequestBody OAuthExchangeRequest request) {
        return authenticationService.exchangeOAuthCode(request.code());
    }
}
