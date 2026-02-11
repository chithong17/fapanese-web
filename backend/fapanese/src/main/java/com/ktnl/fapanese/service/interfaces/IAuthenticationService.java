package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.AuthenticationRequest;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.nimbusds.jose.JOSEException;
import org.springframework.web.bind.annotation.RequestBody;

import java.text.ParseException;
import java.util.Map;

public interface IAuthenticationService {
    AuthenticationResponse login(AuthenticationRequest request);
    AuthenticationResponse loginSocial(UserResponse request);
    AuthenticationResponse refreshToken(String authorizationHeader) throws ParseException, JOSEException;
    void logout(String request) throws ParseException, JOSEException;
    void updatePassword(String email, String newPassword);
}
