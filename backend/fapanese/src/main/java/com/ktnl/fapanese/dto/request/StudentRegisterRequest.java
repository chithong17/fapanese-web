package com.ktnl.fapanese.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class StudentRegisterRequest {
    @NotBlank(message = "First name is required") // map -> ErrorCode.FIRSTNAME_REQUIRED
    private String firstName;

    @NotBlank(message = "Last name is required") // map -> ErrorCode.LASTNAME_REQUIRED
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format") // map -> ErrorCode.EMAIL_INVALID
    private String email;


    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    private String campus;

}
