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
public class Student {
    @Id
    String id;
    String firstname;
    String lastname;
    String campus;
    @JsonFormat(pattern = "dd/MM/yyyy")
    LocalDate dateOfBirth;
    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    User user;
}
