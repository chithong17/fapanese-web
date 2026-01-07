package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.RefreshToken;
import com.ktnl.fapanese.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    void deleteAllByUser(User user);

    // ==========================================
    // Query xóa các token đã hết hạn
    // ==========================================
    @Modifying // Báo cho Spring biết đây là câu lệnh thay đổi dữ liệu (INSERT, UPDATE, DELETE)
    @Query("DELETE FROM RefreshToken t WHERE t.expiryDate < :now")
    int deleteByExpiryDateBefore(Instant now); // Trả về số lượng bản ghi đã xóa (int)
}
