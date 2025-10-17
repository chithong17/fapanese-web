package com.ktnl.fapanese.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponse {
    Long id;
    String courseName;
    String description;
    String imgUrl;
}
