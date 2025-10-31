package com.ktnl.fapanese.dto.request;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ExplainExamRequest {
    String question;
    String options;
    String correctAnswer;
}
