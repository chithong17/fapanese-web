package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.ChangePasswordRequest;
import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.User;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Optional;

public interface IUserService {
    UserResponse registerUser(UserRequest userRequest);
    UserResponse getCurrentUserProfile();
    UserResponse updateUserProfile(UserRequest userRequest);
    void updateStatusUserAfterVerifyOtp(String email);

    void deleteUserByEmail(String email);
    void changePassword(String email, ChangePasswordRequest request);

    void setActiveStatusByEmail(String email, int status);
    List<UserResponse> getPendingTeachers(); // Lấy danh sách giáo viên đang chờ duyệt (status = 2)
    UserResponse updateStatusById(String userId, int status);

}
