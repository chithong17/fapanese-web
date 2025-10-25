package com.ktnl.fapanese.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarDetailRequest {
    private Long id;
    private String structure;
    private String meaning;
    private String example_sentence;
    private String example_meaning;
}