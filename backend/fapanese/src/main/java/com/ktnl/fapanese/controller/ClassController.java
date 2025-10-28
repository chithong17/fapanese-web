package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.ClassCourseRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.ClassCourseRespone;
import com.ktnl.fapanese.entity.ClassCourse;
import com.ktnl.fapanese.entity.StudentClass;
import com.ktnl.fapanese.mapper.ClassCourseMapper;
import com.ktnl.fapanese.service.interfaces.IClassCourseService;
import com.ktnl.fapanese.service.interfaces.IStudentClassService;
import com.ktnl.fapanese.service.interfaces.IStudentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/classes")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ClassController {
    IClassCourseService classCourseService;
    ClassCourseMapper classCourseMapper;
    IStudentClassService studentClassService;



    @GetMapping
    public ApiResponse<List<ClassCourseRespone>> getAllClasses(){
        List<ClassCourseRespone> result = classCourseService.getAllClasses();
        return ApiResponse.<List<ClassCourseRespone>>builder()
                .result(result)
                .message("Successfully retrieved all classes")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ClassCourseRespone> getClassById(@PathVariable Long id){
        ClassCourseRespone result = classCourseService.getClassById(id);
        return ApiResponse.<ClassCourseRespone>builder()
                .result(result)
                .message("Successfully retrieved class")
                .build();
    }

    @GetMapping("/by-course/{courseId}")
    public ApiResponse<ClassCourseRespone> getClassByCourseId(@PathVariable Long courseId) {
        ClassCourseRespone result = classCourseService.getClassByCourseId(courseId);
        return ApiResponse.<ClassCourseRespone>builder()
                .message("Class fetched successfully for course " + courseId)
                .result(result)
                .build();
    }

    @GetMapping("/by-lecturer/{lecturerId}")
    public ApiResponse<List<ClassCourseRespone>> getClassByLecturerId(@PathVariable String lecturerId) {
        List<ClassCourseRespone> result = classCourseService.getClassByLecturerId(lecturerId);
        return ApiResponse.<List<ClassCourseRespone>>builder()
                .message("Class fetched successfully for lecturer " + lecturerId)
                .result(result)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ClassCourseRespone> updateClass(@PathVariable Long id, @RequestBody ClassCourseRequest request) {
        // đảm bảo request có id để service xử lý
        request.setId(id);
        ClassCourseRespone result = classCourseService.updateClass(request);
        return ApiResponse.<ClassCourseRespone>builder()
                .message("Class updated successfully")
                .result(result)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteClass(@PathVariable Long id) {
        classCourseService.deleteClass(id);
        return ApiResponse.<Void>builder()
                .message("Class deleted successfully")
                .build();
    }

    @PostMapping
    public ApiResponse<ClassCourseRespone> createClass(@RequestBody ClassCourseRequest request) {
        ClassCourseRespone result = classCourseService.createClass(request);
        return ApiResponse.<ClassCourseRespone>builder()
                .message("Class created successfully")
                .result(result)
                .build();
    }


    @GetMapping("/student/{studentId}")
    public ApiResponse<List<ClassCourseRespone>> getClassesByStudent(@PathVariable String studentId) {
        List<ClassCourseRespone> result = studentClassService.getClassesByStudent(studentId);
        return ApiResponse.<List<ClassCourseRespone>>builder()
                .result(result)
                .message("Get classes by student success")
                .build();
    }

}
