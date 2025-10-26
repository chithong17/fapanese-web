package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "class_material")
public class ClassMaterial {

    @EmbeddedId
    private ClassMaterialId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("classCourseId")
    @JoinColumn(name = "class_course_id")
    private ClassCourse classCourse;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("materialId")
    @JoinColumn(name = "material_id")
    private Material material;

    private LocalDateTime assignedAt;
    private LocalDateTime deadline;
}
