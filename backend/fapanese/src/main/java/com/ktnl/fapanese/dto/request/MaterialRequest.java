package com.ktnl.fapanese.dto.request;

import com.ktnl.fapanese.entity.Material;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialRequest {
    private String title;
    private String description;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private Material.MaterialType type; // RESOURCE / ASSIGNMENT / EXERCISE
    private Long lecturerId;   // người tạo
}
