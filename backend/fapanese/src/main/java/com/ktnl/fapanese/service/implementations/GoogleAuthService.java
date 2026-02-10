package com.ktnl.fapanese.service.implementations;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.service.interfaces.ISocialAuthService;
import org.springframework.beans.factory.annotation.Value;

import java.util.Collections;

public class GoogleAuthService implements ISocialAuthService {
    @Value("${google.client-id}") // Lưu trong application.yml
    private String googleClientId;

    @Override
    public String getProviderName() {
        return "GOOGLE";
    }

    @Override
    public UserResponse verifyToken(String idTokenString) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();

            return UserResponse.builder()
                    .email(payload.getEmail())
                    .firstName((String) payload.get("given_name"))
                    .lastName((String) payload.get("family_name"))
                    .avtUrl((String) payload.get("picture"))
                    .build();
        }
        throw new AppException(ErrorCode.GOOGLE_AUTH_FAIL);
    }
}
