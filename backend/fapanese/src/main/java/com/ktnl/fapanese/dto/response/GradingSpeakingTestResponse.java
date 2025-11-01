package com.ktnl.fapanese.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradingSpeakingTestResponse {
    private String passage;
    private String picture;
    private String question1;
    private String question2;
    private String overall;
}
