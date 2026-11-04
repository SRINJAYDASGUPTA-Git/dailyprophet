package net.ibmer.dailyprophet.auth.dto;

import lombok.Builder;

@Builder
public record AuthenticationRequest(
        String email,
        String password,
        String name,
        String imageUrl
) {
}
