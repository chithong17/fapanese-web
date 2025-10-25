package com.ktnl.fapanese.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class LecturerRequest{
    private String id;
    private String firstName;
    private String lastName;
    private String expertise;
    private String avtUrl;
    private String bio;
    private String dateOfBirth;
}
