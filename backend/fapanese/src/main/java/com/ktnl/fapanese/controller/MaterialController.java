package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.MaterialRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.MaterialResponse;
import com.ktnl.fapanese.service.interfaces.IMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {
    private final IMaterialService materialService;

    @GetMapping
    public ApiResponse<List<MaterialResponse>> getAllMaterials() {
        List<MaterialResponse> result = materialService.getAllMaterials();
        return ApiResponse.<List<MaterialResponse>>builder()
                .result(result)
                .message("Get all materials success")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<MaterialResponse> getMaterialById(@PathVariable Long id) {
        MaterialResponse result = materialService.getMaterialById(id);
        return ApiResponse.<MaterialResponse>builder()
                .result(result)
                .message("Get material by id success")
                .build();
    }

    @PostMapping
    public ApiResponse<MaterialResponse> createMaterial(@RequestBody MaterialRequest request) {
        MaterialResponse result = materialService.createMaterial(request);
        return ApiResponse.<MaterialResponse>builder()
                .result(result)
                .message("Create material success")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<MaterialResponse> updateMaterial(@PathVariable Long id, @RequestBody MaterialRequest request) {
        MaterialResponse result = materialService.updateMaterial(id, request);
        return ApiResponse.<MaterialResponse>builder()
                .result(result)
                .message("Update material success")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ApiResponse.<String>builder()
                .message("Delete material success")
                .build();
    }

    @PostMapping("/{materialId}/assign")
    public ApiResponse<String> assignMaterialToClass(
            @PathVariable Long materialId,
            @RequestParam Long classCourseId,
            @RequestParam(required = false) LocalDateTime deadline) {

        materialService.assignToClass(materialId, classCourseId, deadline);
        return ApiResponse.<String>builder()
                .message("Assign material to class success")
                .build();
    }

}
