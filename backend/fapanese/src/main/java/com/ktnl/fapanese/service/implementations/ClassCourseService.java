package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.ClassCourseRequest;
import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.dto.response.ClassMaterialResponse;
import com.ktnl.fapanese.dto.response.MaterialResponse;
import com.ktnl.fapanese.dto.response.StudentClassResponse;
import com.ktnl.fapanese.entity.*;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.ClassCourseMapper;
import com.ktnl.fapanese.mapper.ClassMaterialMapper;
import com.ktnl.fapanese.mapper.MaterialMapper;
import com.ktnl.fapanese.mapper.StudentClassMapper;
import com.ktnl.fapanese.repository.*;
import com.ktnl.fapanese.service.interfaces.IClassCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassCourseService implements IClassCourseService {

    private final ClassCourseRepository classCourseRepository;
    private final CourseRepository courseRepository;
    private final LecturerRepository lecturerRepository;
    private final ClassCourseMapper classCourseMapper;
    private final StudentClassRepository studentClassRepository;
    private final StudentClassMapper studentClassMapper;
    private final UserRepository userRepository;
    private final ClassMaterialRepository classMaterialRepository;
    private final ClassMaterialMapper classMaterialMapper;

    @Override
    public ClassCourseRespone createClass(ClassCourseRequest request) {
        // 1. Tìm course và lecturer
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new AppException(ErrorCode.LECTURER_NOT_FOUND));

        // 2. Map request -> entity
        ClassCourse classCourse = classCourseMapper.toClassCourse(request);
        classCourse.setCourse(course);
        classCourse.setLecturer(lecturer);
        classCourse.setSemester(request.getSemester());

        // 3. Validate dữ liệu
        if (classCourse.getClassName() == null || classCourse.getClassName().isBlank()) {
            throw new AppException(ErrorCode.INVALID_CLASS_NAME);
        }

        // 4. Save DB
        ClassCourse saved = classCourseRepository.save(classCourse);

        return classCourseMapper.toClassCourseResponse(saved);
    }

    @Override
    public ClassCourseRespone updateClass(ClassCourseRequest request) {
        // 1. Tìm class theo id
        ClassCourse existing = classCourseRepository.findById(request.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));

        // 2. Cập nhật dữ liệu từ request
        classCourseMapper.updateClass(existing,request);

        // 3. Cập nhật lại quan hệ nếu có
        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
            existing.setCourse(course);
        }

        if (request.getLecturerId() != null ) {
            Lecturer lecturer = lecturerRepository.findById(request.getLecturerId())
                    .orElseThrow(() -> new AppException(ErrorCode.LECTURER_NOT_FOUND));
            existing.setLecturer(lecturer);
        }

        // 4. Save lại
        ClassCourse updated = classCourseRepository.save(existing);

        return classCourseMapper.toClassCourseResponse(updated);
    }

    @Override
    public void deleteClass(Long id) {
        if (!classCourseRepository.existsById(id)) {
            throw new AppException(ErrorCode.CLASS_NOT_FOUND);
        }
        classCourseRepository.deleteById(id);
    }

    @Override
    public List<ClassCourseRespone> getAllClasses() {
        return classCourseRepository.findAll().stream()
                .map(classCourseMapper::toClassCourseResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ClassCourseRespone getClassById(Long id) {
        ClassCourse entity = classCourseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));
        return classCourseMapper.toClassCourseResponse(entity);
    }

    @Override
    public ClassCourseRespone getClassByCourseId(Long courseId) {
        ClassCourse entity = classCourseRepository.findByCourseId(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return classCourseMapper.toClassCourseResponse(entity);
    }



    @Override
    public List<ClassCourseRespone> getClassByLecturerId(String lecturerId) {
        List<ClassCourse> entity = classCourseRepository.findByLecturerId(lecturerId);
        return classCourseMapper.toClassCourseResponses(entity);
    }

    @Override
    public List<StudentClassResponse> getStudentsByClassId(Long classId) {
        ClassCourse aClass = classCourseRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));

        List<StudentClass> list = studentClassRepository.findByIdClassCourseId(classId);
        return studentClassMapper.toStudentClassResponses(list);
    }

    @Override
    public void addStudentToClass(Long classId, String studentId) {
        ClassCourse classCourse = classCourseRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));

        StudentClass studentClass = StudentClass.builder()
                .id(new StudentClassId(studentId, classId))
                .student(student)
                .classCourse(classCourse)
                .enrollDate(LocalDateTime.now())
                .build();

        studentClassRepository.save(studentClass);

    }

    @Override
    public void removeStudentOutClass(Long classId, String studentId) {
        ClassCourse classCourse = classCourseRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));

        StudentClassId studentClassId = new StudentClassId(studentId, classId);
        studentClassRepository.deleteById(studentClassId);
    }

    @Override
    public List<ClassMaterialResponse> getMaterialsByClassId(Long classId) {
        List<ClassMaterial> list = classMaterialRepository.findByClassCourseId(classId);
        return classMaterialMapper.toClassMaterialResponses(list);

    }


}
