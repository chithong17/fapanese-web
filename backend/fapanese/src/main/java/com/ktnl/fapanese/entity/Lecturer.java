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
    private String id;
    @Column(name = "first_name")
    String firstname;
    @Column(name = "last_name")
    String lastname;
    private String expertise;
    @Column(columnDefinition = "TEXT")
    private String bio;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dateOfBirth;
    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;
}

