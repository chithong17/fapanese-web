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
    @NotBlank(message = "Tên không được để trống") // map -> ErrorCode.FIRSTNAME_REQUIRED
    private String firstName;

    @NotBlank(message = "Họ không được để trống") // map -> ErrorCode.LASTNAME_REQUIRED
    private String lastName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ") // map -> ErrorCode.EMAIL_INVALID
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, max = 100, message = "Mật khẩu phải có ít nhất kí tự") // map -> ErrorCode.PASSWORD_INVALID
    private String password;

    @NotBlank(message = "Role không được để trống") // map -> ErrorCode.ROLE_REQUIRED
    private String  role;

    private String expertise;

    private String bio;

    @Past(message = "Ngày sinh không hợp lệ") // map -> ErrorCode.DOB_INVALID
    @JsonFormat(pattern = "yyyy-MM-dd")
            private LocalDate dateOfBirth;

    private String campus;
}
