package com.ktnl.fapanese.controller;


import com.ktnl.fapanese.dto.request.StudentRegisterRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.StudentRegisterResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.service.interfaces.IStudentService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.mapstruct.control.MappingControl;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/students")
public class StudentController {
    IStudentService iStudentService;

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @PostMapping
    public ApiResponse<StudentRegisterResponse> registerStudent(@RequestBody StudentRegisterRequest resquest){
        StudentRegisterResponse response = iStudentService.registerStudent(resquest);

        return ApiResponse.<StudentRegisterResponse>builder()
                .result(response)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @GetMapping
    public ApiResponse<List<UserResponse>> getAllStudent(){
        List<UserResponse> list = iStudentService.getAllStudent();

        return ApiResponse.<List<UserResponse>>builder()
                .result(list)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @GetMapping("/{email}")
    public ApiResponse<UserResponse> getStudentByEmail(@PathVariable String email) {
        UserResponse response = iStudentService.getStudentByEmail(email);
        return ApiResponse.<UserResponse>builder()
                .result(response)
                .message("Get student detail successfully")
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @PutMapping("/{email}")
    public ApiResponse<UserResponse> updateStudent(
            @PathVariable("email") String email,
            @RequestBody StudentRegisterRequest updateRequest) {

        UserResponse response = iStudentService.updateStudent(email, updateRequest);
        return ApiResponse.<UserResponse>builder()
                .result(response)
                .message("Student updated successfully")
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{email}")
    public ApiResponse<Void> deleteStudent(@PathVariable("email") String email) {
        iStudentService.deleteStudent(email);
        return ApiResponse.<Void>builder()
                .message("Student deleted successfully")
                .build();
    }
}