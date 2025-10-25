package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.ClassCourseRequest;
import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.entity.ClassCourse;
import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.entity.Lecturer;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.ClassCourseMapper;
import com.ktnl.fapanese.repository.ClassCourseRepository;
import com.ktnl.fapanese.repository.CourseRepository;
import com.ktnl.fapanese.repository.LecturerRepository;
import com.ktnl.fapanese.service.interfaces.IClassCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassCourseService implements IClassCourseService {

    private final ClassCourseRepository classCourseRepository;
    private final CourseRepository courseRepository;
    private final LecturerRepository lecturerRepository;
    private final ClassCourseMapper classCourseMapper;

    @Override
    public ClassCourseRespone createClass(ClassCourseRequest request) {
        // 1. Tìm course và lecturer
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        Lecturer lecturer = lecturerRepository.findById(request.getLecturer().getId())
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

        if (request.getLecturer() != null && request.getLecturer().getId() != null) {
            Lecturer lecturer = lecturerRepository.findById(request.getLecturer().getId())
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
    public ClassCourseRespone getClassByLecturerId(String lecturerId) {
        ClassCourse entity = classCourseRepository.findByLecturerId(lecturerId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));
       return classCourseMapper.toClassCourseResponse(entity);
    }
}
