package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.StudentRegisterRequest;
import com.ktnl.fapanese.dto.response.StudentRegisterResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
// import org.springframework.security.access.prepost.PreAuthorize; // Có thể xóa import này

import java.util.List;

public interface IStudentService {

    StudentRegisterResponse registerStudent(StudentRegisterRequest student);

    List<UserResponse> getAllStudent();

    UserResponse getStudentByEmail(String email);

    UserResponse updateStudent(String email, StudentRegisterRequest studentUpdateRequest);

    void deleteStudent(String email);
}