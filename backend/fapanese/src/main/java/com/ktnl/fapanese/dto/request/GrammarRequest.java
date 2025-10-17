package com.ktnl.fapanese.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarRequest {
    private Long lessonId;
    private String title;
    private String explanation;
    private List<GrammarDetailRequest> details;
}