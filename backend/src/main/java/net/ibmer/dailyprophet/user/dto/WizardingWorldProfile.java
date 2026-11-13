package net.ibmer.dailyprophet.user.dto;

public record WizardingWorldProfile(
        String uid,
        String profileUrl,
        String name,
        String house,
        String avatarUrl,
        PatronusDto patronus,
        WandDto wand
) {}
