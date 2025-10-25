package com.ktnl.fapanese.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAnswer {
    private Long questionId;
    private String userAnswer; // Đáp án người dùng chọn (A, B, C, D) hoặc điền vào
}