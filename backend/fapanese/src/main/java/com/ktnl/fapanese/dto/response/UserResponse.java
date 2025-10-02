package com.ktnl.fapanese.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private String id;
    private String email;
    private String role;
    // student specific
    private String studentFirstname;
    private String studentLastname;
    private LocalDate studentDateOfBirth;
    private String campus;

    // lecturer specific
    private String teacherFirstname;
    private String teacherLastname;
    private LocalDate teacherDateOfBirth;
    private String expertise;
    private String bio;
}
