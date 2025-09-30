package com.ktnl.fapanese.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterResponse {
    private String id;
    private String email;
    private String role;
    private String message;
}
