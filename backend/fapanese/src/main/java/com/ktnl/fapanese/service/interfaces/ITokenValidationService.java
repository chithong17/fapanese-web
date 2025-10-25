package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.IntrospectRequest;
import com.ktnl.fapanese.dto.response.IntrospectResponse;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;

import java.text.ParseException;

public interface ITokenValidationService {
    IntrospectResponse introspect(IntrospectRequest request) throws ParseException, JOSEException;
    SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException;
}
