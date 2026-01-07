package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.AuthenticationRequest;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface IAuthenticationService {
    AuthenticationResponse login(AuthenticationRequest request);
    AuthenticationResponse refreshToken(String authorizationHeader) throws ParseException, JOSEException;
    void logout(String request) throws ParseException, JOSEException;
    void updatePassword(String email, String newPassword);
}
