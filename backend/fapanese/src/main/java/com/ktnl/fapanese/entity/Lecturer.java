package com.ktnl.fapanese.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Lecturer {
    @Id
    String id;
    String firstName;
    String lastName;
    String expertise;
    String avtUrl;
    @Column(columnDefinition = "TEXT")
    private String bio;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;
}

