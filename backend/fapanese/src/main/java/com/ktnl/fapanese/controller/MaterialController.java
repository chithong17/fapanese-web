package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.MaterialRequest;
import com.ktnl.fapanese.dto.request.UpdateDeadlineRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.dto.response.ClassMaterialResponse;
import com.ktnl.fapanese.dto.response.MaterialResponse;
import com.ktnl.fapanese.service.interfaces.IFileUploadService;
import com.ktnl.fapanese.entity.ClassCourse;
import com.ktnl.fapanese.service.interfaces.IMaterialService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {
    private final IMaterialService materialService;
    private final IFileUploadService fileUploadService;

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

    @GetMapping("/{materialId}/assignments")
    public ApiResponse<List<ClassMaterialResponse>> getAssignedClassByMaterialId(@PathVariable Long materialId){
        List<ClassMaterialResponse> list = materialService.getAssignedClassByMaterialId(materialId);
        return ApiResponse.<List<ClassMaterialResponse>>builder()
                .message("Get Assigned Class success")
                .result(list)
                .build();
    }


    //unassign ra khỏi lớp
    @DeleteMapping("/{materialId}/assign")
    public ApiResponse<String> unAssignMaterialToClass(
            @PathVariable Long materialId,
            @RequestParam Long classCourseId) {

        materialService.unAssignToClass(materialId, classCourseId);
        return ApiResponse.<String>builder()
                .message("Unassign material to class success")
                .build();
    }


    @PutMapping("/{materialId}/assign")
    public ApiResponse<Void> updateMaterialAssignmentDeadline(
            @PathVariable Long materialId,
            @RequestParam Long classCourseId, // Nhận classCourseId từ query param
            @RequestBody UpdateDeadlineRequest request) { // Nhận deadline từ body

        materialService.updateAssignmentDeadline(materialId, classCourseId, request.getDeadline());
        return ApiResponse.<Void>builder()
                .message("Update material assignment deadline success")
                .build();
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<MaterialResponse>> getMaterialsByStudent(@PathVariable String studentId) {
        List<MaterialResponse> materials = materialService.getMaterialsByStudent(studentId);
        return ApiResponse.<List<MaterialResponse>>builder()
                .result(materials)
                .message("Get materials for student's classes success")
                .build();
    }


}
