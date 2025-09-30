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
public class Lecturer {
    @Id
    private Long id;

    private String expertise;
    @Column(columnDefinition = "TEXT")
    private String bio;
    private LocalDate dateOfBirth;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;
}
