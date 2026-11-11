package net.ibmer.dailyprophet.house.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.house.dto.HouseRequest;
import net.ibmer.dailyprophet.house.dto.HouseResponse;
import net.ibmer.dailyprophet.house.services.HouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/houses")
@RequiredArgsConstructor
@Tag(name = "Sorting Hat", description = "The Sorting is a very important ceremony because, while you are here, your house will be something like your family within Hogwarts.")
public class HouseController {
    private final HouseService houseService;

    @GetMapping
    @Operation(
            summary = "Get All Houses"
    )
    public ResponseEntity<List<HouseResponse>> getAllHouses() {
        return ResponseEntity.ok(houseService.getAllHouses());
    }

    @GetMapping("/{name}")
    @Operation(
            summary = "Get the House matching the Name"
    )
    public ResponseEntity<HouseResponse> getHouseByHouseName(@PathVariable String name) {
        return ResponseEntity.ok(houseService.getHouseByHouseName(name));
    }

    @PostMapping
    @Operation(
            summary = "Create a House"
    )
    public ResponseEntity<HouseResponse> createHouse(@RequestBody HouseRequest houseRequest) {
        return ResponseEntity.ok(houseService.addHouse(houseRequest));
    }

    @PutMapping
    @Operation(
            summary = "Update the House matching the Name"
    )
    public ResponseEntity<HouseResponse> updateHouse(@RequestBody HouseRequest houseRequest) {
        return ResponseEntity.ok(houseService.updateHouse(houseRequest));
    }

    @DeleteMapping("/{name}")
    @Operation(
            summary = "Delete the House matching the Name"
    )
    public ResponseEntity<HouseResponse> deleteHouseByHouseName(@PathVariable String name) {
        houseService.deleteHouseByHouseName(name);
        return ResponseEntity.ok().build();
    }
}

