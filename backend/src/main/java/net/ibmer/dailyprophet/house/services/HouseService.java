package net.ibmer.dailyprophet.house.services;

import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.house.dto.HouseRequest;
import net.ibmer.dailyprophet.house.dto.HouseResponse;
import net.ibmer.dailyprophet.house.mapper.HouseMapper;
import net.ibmer.dailyprophet.house.models.House;
import net.ibmer.dailyprophet.house.repositories.HouseRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class HouseService {
    private final HouseMapper houseMapper;
    private final HouseRepo houseRepo;

    //getAllHouses
    public List<HouseResponse> getAllHouses(){
        List<House> houses = houseRepo.findAll();
        return houses.stream().map(houseMapper::toHouseResponse).toList();
    }

    //getHouseByHouseName
    public HouseResponse getHouseByHouseName(String houseName){
        House house = houseRepo.findById(houseName).orElseThrow(()-> new NoSuchElementException("No Such House Exists"));
        return houseMapper.toHouseResponse(house);
    }

    //createHouse
    public HouseResponse addHouse(HouseRequest houseRequest){
        House house = House.builder()
                .name(houseRequest.name())
                .imageUrl(houseRequest.imageUrl())
                .build();

        houseRepo.save(house);
        return houseMapper.toHouseResponse(house);
    }

    //updateHouse
    public HouseResponse updateHouse(HouseRequest houseRequest){
        if(houseRequest.name() == null){
            throw new IllegalArgumentException("House name cannot be empty");
        }

        House house = houseRepo.findById(houseRequest.name()).orElseThrow(()-> new NoSuchElementException("House does not exist"));

        if(houseRequest.imageUrl() != null) house.setImageUrl(houseRequest.imageUrl());

        houseRepo.save(house);
        return houseMapper.toHouseResponse(house);
    }

    //deleteHouse
    public void deleteHouseByHouseName(String houseName){
        if(houseRepo.findById(houseName).isEmpty()){
            throw new IllegalArgumentException("House does not exist");
        }
        houseRepo.deleteById(houseName);
    }
}
