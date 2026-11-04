package net.ibmer.dailyprophet.wand.dto;

public record WandRequest(
         String wandKey,

         String length,
         String wood,
         String core,
         String flexibility,
         String imageUrl
) {
}
