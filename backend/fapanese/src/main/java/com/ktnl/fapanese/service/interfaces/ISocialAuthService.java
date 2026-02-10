package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.UserResponse;

public interface ISocialAuthService {
    UserResponse verifyToken(String token) throws Exception;
    String getProviderName();
}
