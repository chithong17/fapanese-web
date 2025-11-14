package com.ktnl.fapanese.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@Embeddable
public class ClassMaterialId implements Serializable {
    private Long classCourseId;
    private Long materialId;
}