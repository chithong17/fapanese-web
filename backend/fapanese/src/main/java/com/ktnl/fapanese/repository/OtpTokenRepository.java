package com.ktnl.fapanese.repository;
import com.ktnl.fapanese.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailOrderByExpiryTimeDesc(String email);
}
