package com.localfood.model;

public enum Role {
    USER,
    SUPER_ADMIN,
    ADMIN,
    MODERATOR,
    LOCATION_MODERATOR,
    SUPPORT,
    ANALYST;

    public boolean isAdministrative() {
        return this != USER;
    }
}
