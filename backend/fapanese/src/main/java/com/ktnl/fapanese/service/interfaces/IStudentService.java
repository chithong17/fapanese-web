package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.StudentRegisterResquest;
import com.ktnl.fapanese.dto.response.StudentRegisterResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface IStudentService {
    @PreAuthorize("hasAuthority('REGISTER_STUDENT')")
    StudentRegisterResponse registerStudent(StudentRegisterResquest student);

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    List<UserResponse> getAllStudent();

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    UserResponse getStudentByEmail(String email);

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    UserResponse updateStudent(String email, StudentRegisterResquest studentUpdateRequest);

    @PreAuthorize("hasRole('ADMIN')")
    void deleteStudent(String email);
}
