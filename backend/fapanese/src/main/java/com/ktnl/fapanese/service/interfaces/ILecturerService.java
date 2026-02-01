package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.CreateLecturerRequest;
import com.ktnl.fapanese.dto.request.LecturerPagingRequest;
import com.ktnl.fapanese.dto.response.CreateLecturerAccountResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import org.springframework.data.domain.Page;
// import org.springframework.security.access.prepost.PreAuthorize; // Có thể xóa import này

import java.util.List;

public interface ILecturerService {

    CreateLecturerAccountResponse createLecturerAccount(CreateLecturerRequest student);

    Page<UserResponse> getAllLecturer(LecturerPagingRequest request);

    UserResponse getLecturerByEmail(String email);

    UserResponse updateLecturer(String email, CreateLecturerRequest studentUpdateRequest);

    void deleteLecturer(String email);
    List<UserResponse> getPendingTeachers();
    UserResponse updateStatusById(String userId, int status);
}