package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.StudentClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentClassRepository extends JpaRepository<StudentClass, Long> {
    List<StudentClass> findByStudent_Id(String studentId);
}
