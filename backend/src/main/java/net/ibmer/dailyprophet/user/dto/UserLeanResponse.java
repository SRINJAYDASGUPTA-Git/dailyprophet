package net.ibmer.dailyprophet.user.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;

import java.util.List;
import java.util.UUID;

@Builder
@Data
@AllArgsConstructor
@ToString
public class UserLeanResponse {
    private UUID id;
    private String name;
    private String imageUrl;
}
