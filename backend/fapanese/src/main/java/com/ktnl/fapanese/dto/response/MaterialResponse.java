package com.ktnl.fapanese.dto.response;

import com.ktnl.fapanese.entity.Material;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialResponse {
    private Long id;
    private String title;
    private String description;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private Material.MaterialType type;
    private String lecturerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}