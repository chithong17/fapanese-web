package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student,String> {
}
