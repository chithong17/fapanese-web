package com.ktnl.fapanese.dto.response;

import com.ktnl.fapanese.entity.MaterialSubmission;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialSubmissionResponse {
    private Long id;
    private String studentId;
    private String studentName;
    private Long materialId;
    private String materialTitle;
    private Long classCourseId;
    private String className;

    private LocalDateTime submittedAt;
    private String fileUrl;
    private String fileType;
    private String submissionText;
    private String submissionLink;

    private Double score;
    private String feedback;
    private MaterialSubmission.Status status;
}
