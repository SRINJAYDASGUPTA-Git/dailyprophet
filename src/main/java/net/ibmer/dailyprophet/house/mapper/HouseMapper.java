package net.ibmer.dailyprophet.house.mapper;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.house.dto.HouseRequest;
import net.ibmer.dailyprophet.house.dto.HouseResponse;
import net.ibmer.dailyprophet.house.models.House;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HouseMapper {
    public HouseResponse toHouseResponse(House house) {
        return HouseResponse.builder()
                .name(house.getName())
                .imageUrl(house.getImageUrl())
                .build();
    }
}
