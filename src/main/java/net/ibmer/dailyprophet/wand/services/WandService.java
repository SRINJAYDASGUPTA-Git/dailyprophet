package net.ibmer.dailyprophet.wand.services;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.wand.dto.WandRequest;
import net.ibmer.dailyprophet.wand.dto.WandResponse;
import net.ibmer.dailyprophet.wand.mapper.WandMapper;
import net.ibmer.dailyprophet.wand.models.Wand;
import net.ibmer.dailyprophet.wand.repositories.WandRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class WandService {
    private final WandMapper wandMapper;
    private final WandRepo wandRepo;

    //getAllWands
    public List<WandResponse> getAllWands(){
        List<Wand> wands = wandRepo.findAll();
        return wands.stream().map(wandMapper::toWandResponse).toList();
    }

    //getWandByWandKey
    public WandResponse getWandByWandKey(String wandKey){
        Wand wand = wandRepo.findById(wandKey).orElseThrow(()-> new NoSuchElementException("Wand not found"));
        return wandMapper.toWandResponse(wand);
    }

    //createWand
    public WandResponse addWand(WandRequest wandRequest){
        Wand wand = Wand.builder()
                .wandKey(wandRequest.wandKey())
                .length(wandRequest.length())
                .wood(wandRequest.wood())
                .core(wandRequest.core())
                .flexibility(wandRequest.flexibility())
                .imageUrl(wandRequest.imageUrl())
                .build();

        wandRepo.save(wand);
        return wandMapper.toWandResponse(wand);
    }

    //updateWand
    public WandResponse updateWand(WandRequest wandRequest){
        if(wandRequest.wandKey() == null){
            throw new IllegalArgumentException("WandKey is required");
        }

        Wand wand = wandRepo.findById(wandRequest.wandKey()).orElseThrow(()-> new NoSuchElementException("Wand not found"));

        if(wandRequest.wood() != null) wand.setWood(wandRequest.wood());
        if(wandRequest.length() != null) wand.setLength(wandRequest.length());
        if(wandRequest.flexibility() != null) wand.setFlexibility(wandRequest.flexibility());
        if(wandRequest.core() != null) wand.setCore(wandRequest.core());
        if(wandRequest.imageUrl() != null) wand.setImageUrl(wandRequest.imageUrl());

        wandRepo.save(wand);
        return wandMapper.toWandResponse(wand);
    }

    //deleteWandByKey
    public void deleteWandByWandKey(String wandKey){
        if(wandRepo.findById(wandKey).isEmpty()){
            throw new NoSuchElementException("Wand not found");
        }
        wandRepo.deleteById(wandKey);
    }

}
