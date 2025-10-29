package com.ktnl.fapanese.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateDeadlineRequest {
    private LocalDateTime deadline;
}
