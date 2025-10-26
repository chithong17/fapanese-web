package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.MaterialRequest;
import com.ktnl.fapanese.dto.response.MaterialResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface IMaterialService {
    List<MaterialResponse> getAllMaterials();
    MaterialResponse getMaterialById(Long id);
    MaterialResponse createMaterial(MaterialRequest request);
    MaterialResponse updateMaterial(Long id, MaterialRequest request);
    void deleteMaterial(Long id);
    void assignToClass(Long materialId, Long classCourseId, LocalDateTime deadline);
}
