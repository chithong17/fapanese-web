package com.ktnl.fapanese.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "course")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "course_name", nullable = false)
    String courseName;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "imgUrl")
    String imgUrl;
    @Column(name = "price")
    String price;

    @Column(name = "level")
    String level;

    @Column(name = "code", unique = true) 
    String code;

    @Column(name = "title")
    String title;

    @Column(name = "duration")
    String duration;

    @Builder.Default
    @JsonManagedReference
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Lesson> lessons = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Overview> overviews = new HashSet<>();
}
