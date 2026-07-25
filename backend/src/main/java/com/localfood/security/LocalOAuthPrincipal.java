package com.localfood.security;

import com.localfood.model.User;

public interface LocalOAuthPrincipal {
    User getLocalUser();
}
