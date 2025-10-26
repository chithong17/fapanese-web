package com.ktnl.fapanese.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialSubmissionRequest {
    private String studentId;
    private Long materialId;
    private Long classCourseId;

    private String fileUrl;       // file bài nộp (nếu có)
    private String fileType;
    private String submissionText; // text viết trực tiếp
    private String submissionLink; // link Google Docs hoặc link drive
}
