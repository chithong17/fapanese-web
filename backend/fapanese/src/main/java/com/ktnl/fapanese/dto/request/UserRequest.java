package com.ktnl.fapanese.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequest {
    private String email;
    private String password;
    private String role;
    private String expertise;
    private String bio;
    private String dateOfBirth;
    private String campus;
}
