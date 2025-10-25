package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.ClassCourseRequest;
import com.ktnl.fapanese.dto.response.ClassCourseRespone;

import java.util.List;

public interface IClassCourseService {
    ClassCourseRespone createClass(ClassCourseRequest request);
    ClassCourseRespone updateClass(ClassCourseRequest request);
    void deleteClass(Long id);

    List<ClassCourseRespone> getAllClasses();

    ClassCourseRespone getClassById(Long id);
    ClassCourseRespone getClassByCourseId(Long courseId);

    ClassCourseRespone getClassByLecturerId(String lecturerId);
}
