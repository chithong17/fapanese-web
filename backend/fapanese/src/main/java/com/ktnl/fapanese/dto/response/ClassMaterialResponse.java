package com.ktnl.fapanese.dto.response;

import com.ktnl.fapanese.entity.ClassCourse;
import com.ktnl.fapanese.entity.ClassMaterialId;
import com.ktnl.fapanese.entity.Material;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ClassMaterialResponse {
    private ClassMaterialId id;

    private ClassCourseRespone classCourse;

    private MaterialResponse material;

    private LocalDateTime assignedAt;
    private LocalDateTime deadline;
}
