package net.ibmer.dailyprophet.patronus.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.patronus.dto.PatronusRequest;
import net.ibmer.dailyprophet.patronus.dto.PatronusResponse;
import net.ibmer.dailyprophet.patronus.services.PatronusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patronusCharms")
@RequiredArgsConstructor
@Tag(name = "Expecto Patronum", description = "Happiness can be found in the darkest of times if one only remembers to turn on the lights.")
public class PatronusController {
    private final PatronusService patronusService;

    @GetMapping
    @Operation(
            summary = "Get All Patronus Charms"
    )
    public ResponseEntity<List<PatronusResponse>>  getAllPatronusCharms() {
        return ResponseEntity.ok(patronusService.getAllPatronusCharms());
    }

    @GetMapping("/{name}")
    @Operation(
            summary = "Get a Patronus by Name"
    )
    public ResponseEntity<PatronusResponse> getPatronusByName(@PathVariable String name) {
        return ResponseEntity.ok(patronusService.getPatronusByName(name));
    }

    @PostMapping
    @Operation(
            summary = "Create a Patronus"
    )
    public ResponseEntity<PatronusResponse> createPatronus(@RequestBody PatronusRequest patronusRequest) {
        return ResponseEntity.ok(patronusService.addPatronus(patronusRequest));
    }

    @PutMapping
    @Operation(
            summary = "Update a Patronus"
    )
    public ResponseEntity<PatronusResponse>  updatePatronus(@RequestBody PatronusRequest patronusRequest) {
        return ResponseEntity.ok(patronusService.updatePatronus(patronusRequest));
    }

    @DeleteMapping("/{name}")
    @Operation(
            summary = "Delete a Patronus by Name"
    )
    public ResponseEntity<?>  deletePatronus(@PathVariable String name) {
        patronusService.deletePatronus(name);
        return ResponseEntity.ok().build();
    }
}
