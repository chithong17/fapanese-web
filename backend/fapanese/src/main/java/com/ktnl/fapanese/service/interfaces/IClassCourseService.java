package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.ClassCourseRequest;
import com.ktnl.fapanese.dto.response.*;

import java.util.List;

public interface IClassCourseService {
    ClassCourseRespone createClass(ClassCourseRequest request);
    ClassCourseRespone updateClass(ClassCourseRequest request);
    void deleteClass(Long id);

    List<ClassCourseRespone> getAllClasses();

    ClassCourseRespone getClassById(Long id);
    ClassCourseRespone getClassByCourseId(Long courseId);

    List<ClassCourseRespone> getClassByLecturerId(String lecturerId);

    List<StudentClassResponse> getStudentsByClassId(Long classId);

    void addStudentToClass(Long classId, String studentId);

    void removeStudentOutClass(Long classId, String studentId);

    List<ClassMaterialResponse> getMaterialsByClassId(Long classId);
}
