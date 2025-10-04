package com.ktnl.fapanese.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class UserRequest {
    @NotBlank(message = "First name is required") // map -> ErrorCode.FIRSTNAME_REQUIRED
    private String firstName;

    @NotBlank(message = "Last name is required") // map -> ErrorCode.LASTNAME_REQUIRED
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format") // map -> ErrorCode.EMAIL_INVALID
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters") // map -> ErrorCode.PASSWORD_INVALID
    private String password;

    @NotBlank(message = "Role is required") // map -> ErrorCode.ROLE_REQUIRED
    private String role;

    private String expertise;

    private String bio;

    @Past(message = "Date of birth must be in the past") // map -> ErrorCode.DOB_INVALID
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Campus is required") // map -> ErrorCode.CAMPUS_REQUIRED
    private String campus;
}
