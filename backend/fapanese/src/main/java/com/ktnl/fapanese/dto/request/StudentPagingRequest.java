package com.ktnl.fapanese.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class StudentPagingRequest extends BasePagingRequest {
    private String campus;
    private Integer status;
    private String keyword;
}
