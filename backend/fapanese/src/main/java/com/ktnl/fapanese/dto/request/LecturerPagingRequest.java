package com.ktnl.fapanese.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class LecturerPagingRequest extends BasePagingRequest {
    private String expertise;
    private Integer status;
    private String keyword;
}
