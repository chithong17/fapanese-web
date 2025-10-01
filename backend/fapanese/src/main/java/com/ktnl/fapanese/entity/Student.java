package com.ktnl.fapanese.entity;

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
    private String id;

    private String campus;
    private LocalDate dateOfBirth;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;
}
