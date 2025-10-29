package com.ktnl.fapanese.repository;


import com.ktnl.fapanese.entity.*;
import com.ktnl.fapanese.entity.StudentClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface StudentClassRepository extends JpaRepository<StudentClass, Long> {
    List<StudentClass> findByStudent_Id(String studentId);
@Repository
public interface StudentClassRepository extends JpaRepository<StudentClass, StudentClassId> {
    List<StudentClass> findByIdClassCourseId(Long classCourse);

}
