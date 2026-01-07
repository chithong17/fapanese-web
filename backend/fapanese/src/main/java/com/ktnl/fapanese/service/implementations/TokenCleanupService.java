package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@Slf4j // Để ghi log xem xóa được bao nhiêu
@RequiredArgsConstructor
public class TokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Chạy định kỳ vào 00:00:00 mỗi ngày
     * cron = "giây phút giờ ngày tháng thứ"
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional // Bắt buộc phải có vì đây là thao tác DELETE
    public void cleanupExpiredTokens() {
        log.info("Bắt đầu dọn dẹp các Refresh Token hết hạn...");

        // Xóa tất cả token có thời gian hết hạn nhỏ hơn thời điểm hiện tại
        int deletedCount = refreshTokenRepository.deleteByExpiryDateBefore(Instant.now());

        log.info("Đã xóa {} token hết hạn khỏi Database.", deletedCount);
    }
}