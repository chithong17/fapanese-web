package com.ktnl.fapanese.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseRequest {
    @NotBlank(message = "Tên khóa học không được để trống")
    String courseName;
    String description;
    String imgUrl;
    String price;
    String level;
    @NotBlank(message = "Code khóa học không được để trống")
    String code;
    String title;
    String duration;
}
