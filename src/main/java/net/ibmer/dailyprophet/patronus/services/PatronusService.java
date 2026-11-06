package net.ibmer.dailyprophet.patronus.services;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.patronus.dto.PatronusRequest;
import net.ibmer.dailyprophet.patronus.dto.PatronusResponse;
import net.ibmer.dailyprophet.patronus.mapper.PatronusMapper;
import net.ibmer.dailyprophet.patronus.models.Patronus;
import net.ibmer.dailyprophet.patronus.repositories.PatronusRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PatronusService {
    private final PatronusMapper patronusMapper;
    private final PatronusRepo patronusRepo;

    //getAllPatronusCharms
    public List<PatronusResponse> getAllPatronusCharms() {
        List<Patronus> patronus = patronusRepo.findAll();
        return patronus.stream().map(patronusMapper::toPatronusResponse).toList();
    }

    //getPatronusByName
    public PatronusResponse getPatronusByName(String patronusName) {
        Patronus patronus = patronusRepo.findById(patronusName).orElseThrow(()-> new NoSuchElementException("Patronus with name " + patronusName + " not found"));
        return patronusMapper.toPatronusResponse(patronus);
    }

    //createPatronus
    public PatronusResponse addPatronus(PatronusRequest patronusRequest) {
        Patronus patronus = Patronus.builder()
                .name(patronusRequest.name())
                .imageUrl(patronusRequest.imageUrl())
                .build();

        patronusRepo.save(patronus);
        return patronusMapper.toPatronusResponse(patronus);
    }

    //updatePatronus
    public PatronusResponse updatePatronus(PatronusRequest patronusRequest) {
        if(patronusRequest.name() == null){
            throw new IllegalArgumentException("Patronus name is required");
        }

        Patronus patronus = patronusRepo.findById(patronusRequest.name()).orElseThrow(()-> new NoSuchElementException("Patronus with name " + patronusRequest.name() + " not found"));

        if(patronusRequest.imageUrl() != null) patronus.setImageUrl(patronusRequest.imageUrl());

        patronusRepo.save(patronus);
        return patronusMapper.toPatronusResponse(patronus);
    }

    //deletePatronus
    public void deletePatronus(String patronusName) {
        if(patronusRepo.findById(patronusName).isEmpty()){
            throw new IllegalArgumentException("Patronus name is required");
        }

        patronusRepo.deleteById(patronusName);
    }

}
