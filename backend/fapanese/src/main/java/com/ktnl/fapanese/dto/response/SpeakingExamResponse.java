package com.ktnl.fapanese.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.ktnl.fapanese.entity.enums.SpeakingExamType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SpeakingExamResponse {
    private Long id;
    private Long overviewPartId;
    private String title;
    private SpeakingExamType type;

    // 👈 Dùng DTO (từ câu hỏi đầu tiên của bạn)
    private Set<SpeakingRespone> speakings;
}
