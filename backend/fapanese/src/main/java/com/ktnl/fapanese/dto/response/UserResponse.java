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
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String expertise;
    private String bio;
    private LocalDate teacherDateOfBirth;
    private String campus;
    private LocalDate studentDateOfBirth;
}
