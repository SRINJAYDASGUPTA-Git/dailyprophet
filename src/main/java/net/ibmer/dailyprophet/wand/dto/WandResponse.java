package net.ibmer.dailyprophet.wand.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class WandResponse {
    private String wandKey;

    private String length;
    private String wood;
    private String core;
    private String flexibility;
    private String imageUrl;
}
