package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.CreateStudentRequest;
import com.ktnl.fapanese.dto.response.CreateStudentAccountResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
// import org.springframework.security.access.prepost.PreAuthorize; // Có thể xóa import này

import java.util.List;

public interface IStudentService {

    CreateStudentAccountResponse createStudentAccount(CreateStudentRequest student);

    List<UserResponse> getAllStudent();

    UserResponse getStudentByEmail(String email);

    UserResponse updateStudent(String email, CreateStudentRequest studentUpdateRequest);

    void deleteStudent(String email);
    boolean createStudentAccountList(List<CreateStudentRequest> list);
}