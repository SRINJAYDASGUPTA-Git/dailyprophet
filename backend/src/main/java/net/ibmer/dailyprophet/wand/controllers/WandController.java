package net.ibmer.dailyprophet.wand.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import net.ibmer.dailyprophet.wand.dto.WandRequest;
import net.ibmer.dailyprophet.wand.dto.WandResponse;
import net.ibmer.dailyprophet.wand.services.WandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wands")
@RequiredArgsConstructor
@Tag(name = "Ollivanders Wand Shop", description = "Makers of Fine Wands since 382BC")
public class WandController {
    private final WandService wandService;

    @GetMapping
    @Operation(
            summary = "Get All Wands",
            description = "Returns the details of All Wands"
    )
    public ResponseEntity<List<WandResponse>> getAllWands(){
        return ResponseEntity.ok(wandService.getAllWands());
    }

    @GetMapping("/{wandKey}")
    @Operation(
            summary = "Get the Wand matching the WandKey"
    )
    public ResponseEntity<WandResponse> getWandByWandKey(@PathVariable String wandKey){
        return ResponseEntity.ok(wandService.getWandByWandKey(wandKey));
    }

    @PostMapping
    @Operation(
            summary = "Create a Wand"
    )
    public ResponseEntity<WandResponse> createWand(@RequestBody WandRequest wandRequest){
        return ResponseEntity.ok(wandService.addWand(wandRequest));
    }

    @PutMapping
    @Operation(
            summary = "Update the Wand matching the WandKey"
    )
    public ResponseEntity<WandResponse> updateWand(@RequestBody WandRequest wandRequest){
        return ResponseEntity.ok(wandService.updateWand(wandRequest));
    }

    @DeleteMapping("/{wandKey}")
    @Operation(
            summary = "Delete the Wand matching the WandKey"
    )
    public ResponseEntity<?> deleteWandByWandKey(@PathVariable String wandKey){
        wandService.deleteWandByWandKey(wandKey);
        return ResponseEntity.ok().build();
    }
}

