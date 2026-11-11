package net.ibmer.dailyprophet.wand.mapper;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.wand.dto.WandResponse;
import net.ibmer.dailyprophet.wand.models.Wand;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WandMapper {
    public WandResponse toWandResponse(Wand wand) {

        return WandResponse.builder()
                .wandKey(wand.getWandKey())
                .wood(wand.getWood())
                .length(wand.getLength())
                .flexibility(wand.getFlexibility())
                .core(wand.getCore())
                .imageUrl(wand.getImageUrl())
                .build();
    }
}
