package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.ClassCourse;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.entity.StudentClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student,String> {
    @Query("""
       select s
       from Student s
       where s.user.email = :email or s.id = :id
       """)
    Optional<Student> findByEmailOrId(@Param("email") String email,
                                      @Param("id") String id);}
