package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.entity.ClassCourse;
import com.ktnl.fapanese.entity.StudentClass;
import com.ktnl.fapanese.mapper.ClassCourseMapper;
import com.ktnl.fapanese.repository.StudentClassRepository;
import com.ktnl.fapanese.service.interfaces.IStudentClassService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentClassService implements IStudentClassService {

    private final StudentClassRepository studentClassRepository;
    private final ClassCourseMapper classCourseMapper;

    @Override
    public List<ClassCourseRespone> getClassesByStudent(String studentId) {
        List<StudentClass> enrollments = studentClassRepository.findByStudent_Id(studentId);

        List<ClassCourse> classCourses = enrollments.stream()
                .map(StudentClass::getAClass)
                .distinct()
                .toList();

        return classCourseMapper.toClassCourseResponses(classCourses);
    }
}
