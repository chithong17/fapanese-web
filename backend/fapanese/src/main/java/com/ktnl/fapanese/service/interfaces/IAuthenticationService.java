package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.AuthenticationRequest;
import com.ktnl.fapanese.dto.request.LogoutRequest;
import com.ktnl.fapanese.dto.request.RefreshRequest;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface IAuthenticationService {
    AuthenticationResponse login(AuthenticationRequest request);
    AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;
    void logout(LogoutRequest request) throws ParseException, JOSEException;
    void updatePassword(String email, String newPassword);
}
