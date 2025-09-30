package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Student {
    @Id
    String id; // Trùng với User.id

    @OneToOne
    @MapsId   // Dùng chung khóa chính với User
    @JoinColumn(name = "id")
    User user;

    private String campus;

    @Column(name = "dob")
    private LocalDate dob;

}
