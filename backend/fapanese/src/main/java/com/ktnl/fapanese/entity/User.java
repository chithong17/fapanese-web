package com.ktnl.fapanese.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.Set;



@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String email;
    String password_hash;

    //-1: bị từ chối
    //0: dki chua xac thuc email
    //1: da xac thuc email chua active
    //2: da xac thuc da active cho admin duyet (Lecturer)
    //3: dc active, hoat dong binh thuong
    @Builder.Default
    @Column(nullable = false)
    int status = 0;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    Lecturer teacher;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    Student student;

    @ManyToMany
    Set<Role> roles;
}
