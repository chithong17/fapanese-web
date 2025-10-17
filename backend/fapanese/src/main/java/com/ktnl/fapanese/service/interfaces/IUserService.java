package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.UserResponse;

public interface IUserService {
    UserResponse registerUser(UserRequest userRequest);
    UserResponse getCurrentUserProfile();
    UserResponse updateUserProfile(UserRequest userRequest);
    void updateStatusUserAfterVerifyOtp(String email);
    void deleteUserByEmail(String email);
}
