package com.ktnl.fapanese.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class UserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role;
    private String firstName;
    private String lastName;
    private String expertise;
    private String bio;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private String dateOfBirth;
    private String campus;
}
