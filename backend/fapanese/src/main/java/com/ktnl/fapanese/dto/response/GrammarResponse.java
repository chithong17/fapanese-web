package com.ktnl.fapanese.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarResponse {
    private String id;
    private String lessonId;
    private String title;
    private String explanation;
    private List<GrammarDetailResponse> details;
}