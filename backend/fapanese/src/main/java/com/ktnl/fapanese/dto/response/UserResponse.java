package com.ktnl.fapanese.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private String id;
    private String email;
    private String role;
    private String firstname;
    private String lastname;
    private LocalDate dob;

    // student specific
    private String campus;

    // lecturer specific
    private String expertise;
    private String bio;
}
