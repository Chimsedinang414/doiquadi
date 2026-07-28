package com.localfood.dto;

import java.util.Set;

public record OAuthLinkStatusResponse(Set<String> linkedProviders) {
}
