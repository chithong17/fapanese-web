package com.ktnl.fapanese.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtDecoder;

public class CustomJwtDecoder implements JwtDecoder {
    @Value()
    private String signerKey
}
