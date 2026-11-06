package net.ibmer.dailyprophet.patronus.mapper;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.patronus.dto.PatronusResponse;
import net.ibmer.dailyprophet.patronus.models.Patronus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatronusMapper {
    public PatronusResponse toPatronusResponse(Patronus patronus) {
        return PatronusResponse.builder()
                .name(patronus.getName())
                .imageUrl(patronus.getImageUrl())
                .build();
    }
}
