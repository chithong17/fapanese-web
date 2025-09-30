package com.ktnl.fapanese.service;


import com.ktnl.fapanese.dto.request.AuthenticationRequest;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.repository.UserRepository;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.nimbusds.jose.JWSHeader;

import java.util.Date;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;

    @NonFinal
    @Value("${jwt.valid-duration}") // Lấy khóa bí mật từ application.properties (dùng để ký và verify JWT)
    protected long VALID_DURATION;

    public AuthenticationResponse login(AuthenticationRequest request){
        var user = userRepository.findByEmail(request.getEmail()).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        //check xem password khop chua
        var authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword_hash());

        //neu sai nem ra exception
        if(!authenticated){
            throw new AppException(ErrorCode.AUTHENTICATED);
        }

        //neu dung generate token
        var token

    }

    private String generateToken(User user){
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("ktnl.com")
                .issueTime(new Date())
                .expirationTime()
                .build();
    }
}
