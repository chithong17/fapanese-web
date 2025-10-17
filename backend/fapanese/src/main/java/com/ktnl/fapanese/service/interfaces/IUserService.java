package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.StudentRegisterResquest;
import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.StudentRegisterResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import org.springframework.security.access.prepost.PreAuthorize;

public interface IUserService {
    UserResponse registerUser(UserRequest userRequest);
    UserResponse getCurrentUserProfile();
    UserResponse updateUserProfile(UserRequest userRequest);
    void updateStatusUserAfterVerifyOtp(String email);
    void deleteUserByEmail(String email);

    @PreAuthorize("hasRole('ADMIN')")
    StudentRegisterResponse registerStudent(StudentRegisterResquest student);
}
