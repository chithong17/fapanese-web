package com.ktnl.fapanese.repository;


import com.ktnl.fapanese.entity.*;
import com.ktnl.fapanese.entity.StudentClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentClassRepository extends JpaRepository<StudentClass, StudentClassId> {

    // Lấy tất cả StudentClass theo student_id
    List<StudentClass> findByStudent_Id(String studentId);

    // (tuỳ chọn) Lấy tất cả StudentClass theo classCourseId
    List<StudentClass> findByIdClassCourseId(Long classCourseId);
}
