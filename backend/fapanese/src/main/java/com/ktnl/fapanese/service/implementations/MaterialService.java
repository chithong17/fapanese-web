package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.MaterialRequest;
import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.dto.response.ClassMaterialResponse;
import com.ktnl.fapanese.dto.response.MaterialResponse;
import com.ktnl.fapanese.entity.*;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.ClassCourseMapper;
import com.ktnl.fapanese.mapper.ClassMaterialMapper;
import com.ktnl.fapanese.mapper.MaterialMapper;
import com.ktnl.fapanese.repository.*;
import com.ktnl.fapanese.service.interfaces.IMaterialService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MaterialService implements IMaterialService {

    MaterialRepository materialRepository;
    LecturerRepository lecturerRepository;
    MaterialMapper materialMapper;
    ClassCourseRepository classCourseRepository;
    ClassMaterialRepository classMaterialRepository;
    ClassMaterialMapper classMaterialMapper;
    StudentClassRepository studentClassRepository;


    @Override
    public List<MaterialResponse> getAllMaterials() {
        List<Material> materials = materialRepository.findAll();
        return materialMapper.toMaterialResponseList(materials);
    }

    @Override
    public MaterialResponse getMaterialById(Long id) {
        Material material = findMaterialById(id);
        return materialMapper.toMaterialResponse(material);
    }

    @Override
    @Transactional
    public MaterialResponse createMaterial(MaterialRequest request) {
        Material material = materialMapper.toMaterial(request);

        // Gán lecturer
        Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new AppException(ErrorCode.LECTURER_NOT_FOUND));
        material.setLecturer(lecturer);

        material.setCreatedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());

        Material saved = materialRepository.save(material);
        return materialMapper.toMaterialResponse(saved);
    }

    @Override
    @Transactional
    public MaterialResponse updateMaterial(Long id, MaterialRequest request) {
        Material existing = findMaterialById(id);
        materialMapper.updateMaterial(existing, request);

        // Nếu thay đổi lecturer
        if (request.getLecturerId() != null &&
                !existing.getLecturer().getId().equals(request.getLecturerId())) {
            Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                    .orElseThrow(() -> new AppException(ErrorCode.LECTURER_NOT_FOUND));
            existing.setLecturer(lecturer);
        }

        existing.setUpdatedAt(LocalDateTime.now());

        Material updated = materialRepository.save(existing);
        return materialMapper.toMaterialResponse(updated);
    }

    @Override
    @Transactional
    public void deleteMaterial(Long id) {
        Material material = findMaterialById(id);
        materialRepository.delete(material);
    }

    // ===== Helper =====
    private Material findMaterialById(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MATERIAL_NOT_FOUND));
    }

    @Override
    @Transactional
    public void assignToClass(Long materialId, Long classCourseId, LocalDateTime deadline) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new AppException(ErrorCode.MATERIAL_NOT_FOUND));
        ClassCourse classCourse = classCourseRepository.findById(classCourseId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_COURSE_NOT_FOUND));

        ClassMaterial classMaterial = ClassMaterial.builder()
                .id(new ClassMaterialId(classCourseId, materialId))
                .material(material)
                .classCourse(classCourse)
                .assignedAt(LocalDateTime.now())
                .deadline(deadline)
                .build();

        classMaterialRepository.save(classMaterial);
    }

    @Override
    public void unAssignToClass(Long materialId, Long classCourseId) {
        ClassMaterialId classMaterialId = new ClassMaterialId(classCourseId, materialId);
        ClassMaterial classMaterial = classMaterialRepository.findById(classMaterialId)
                .orElseThrow(() -> new AppException(ErrorCode.ClASS_MATERIALS_NOT_FOUND));
        classMaterialRepository.delete(classMaterial);
    }

    @Override
    public List<ClassMaterialResponse> getAssignedClassByMaterialId(Long materialId) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new AppException(ErrorCode.MATERIAL_NOT_FOUND));
        Set<ClassMaterial> classMaterials = material.getClassMaterials();

        return classMaterialMapper.toClassMaterialResponses(new ArrayList<>(classMaterials));
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<MaterialResponse> getMaterialsByStudent(String studentId) {
        // 1️⃣ Lấy tất cả lớp mà học sinh tham gia
        List<StudentClass> enrolledClasses = studentClassRepository.findByStudent_Id(studentId);
        if (enrolledClasses.isEmpty()) {
            throw new AppException(ErrorCode.ACTION_NOT_ALLOWED, "Student is not assigned to any class.");
        }

        // 2️⃣ Lấy tất cả ID lớp
        List<Long> classIds = enrolledClasses.stream()
                .map(sc -> sc.getAClass().getId())
                .toList();

        // 3️⃣ Lấy danh sách ClassMaterial trong các lớp đó
        List<ClassMaterial> classMaterials = classMaterialRepository.findByClassCourse_IdIn(classIds);

        // 4️⃣ Trích ra Material, loại trùng
        List<Material> materials = classMaterials.stream()
                .map(ClassMaterial::getMaterial)
                .distinct()
                .toList();

        return materialMapper.toMaterialResponseList(materials);
    }
}
