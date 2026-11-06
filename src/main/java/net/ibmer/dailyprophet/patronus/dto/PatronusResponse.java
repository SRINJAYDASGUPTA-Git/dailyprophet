package net.ibmer.dailyprophet.patronus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PatronusResponse {
    private String name;
    private String imageUrl;
}
