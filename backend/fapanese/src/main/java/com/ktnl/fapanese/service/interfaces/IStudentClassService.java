package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.ClassCourseRespone;

import java.util.List;

public interface IStudentClassService {
    List<ClassCourseRespone> getClassesByStudent(String studentId);
}
