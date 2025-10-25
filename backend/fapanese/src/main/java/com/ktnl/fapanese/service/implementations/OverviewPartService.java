package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.OverviewPartRequest;
import com.ktnl.fapanese.dto.response.LessonPartSimpleResponse;
import com.ktnl.fapanese.dto.response.OverviewPartResponse;
import com.ktnl.fapanese.entity.LessonPart;
import com.ktnl.fapanese.entity.Overview;
import com.ktnl.fapanese.entity.OverviewPart;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.OverviewPartMapper;
import com.ktnl.fapanese.repository.OverviewPartRepository;
import com.ktnl.fapanese.repository.OverviewRepository;
import com.ktnl.fapanese.service.interfaces.IOverviewPartService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OverviewPartService implements IOverviewPartService {

    OverviewPartRepository overviewPartRepository;
    OverviewRepository overviewRepository; // Dependency cha
    OverviewPartMapper overviewPartMapper;

    // READ (All)
    @Override
    @Transactional(readOnly = true) // 👈 Quan trọng để load lazy các Set con
    public List<OverviewPartResponse> getAllOverviewParts() {
        List<OverviewPart> overviewParts = overviewPartRepository.findAll();
        return overviewPartMapper.toOverviewPartResponseList(overviewParts);
    }

    // READ (By Id)
    @Override
    @Transactional(readOnly = true) // 👈 Quan trọng để load lazy các Set con
    public OverviewPartResponse getOverviewPartById(Long id) {
        OverviewPart overviewPart = findOverviewPartById(id);
        return overviewPartMapper.toOverviewPartResponse(overviewPart);
    }

    // CREATE
    @Override
    @Transactional
    public OverviewPartResponse createOverviewPart(OverviewPartRequest request) {
        OverviewPart overviewPart = overviewPartMapper.toOverviewPart(request);

        // Xử lý quan hệ ManyToOne (cha)
        Overview overview = overviewRepository.findById(request.getOverviewId())
                .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_NOT_FOUND));
        overviewPart.setOverview(overview);

        OverviewPart savedOverviewPart = overviewPartRepository.save(overviewPart);
        return overviewPartMapper.toOverviewPartResponse(savedOverviewPart);
    }

    // UPDATE
    @Override
    @Transactional
    public OverviewPartResponse updateOverviewPart(Long id, OverviewPartRequest request) {
        OverviewPart existingPart = findOverviewPartById(id);

        // Cập nhật các trường cơ bản (title, type)
        overviewPartMapper.updateOverviewPart(existingPart, request);

        // Cập nhật quan hệ ManyToOne (nếu ID cha thay đổi)
        if (!existingPart.getOverview().getId().equals(request.getOverviewId())) {
            Overview overview = overviewRepository.findById(request.getOverviewId())
                    .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_NOT_FOUND));
            existingPart.setOverview(overview);
        }

        OverviewPart updatedPart = overviewPartRepository.save(existingPart);
        // Cần load lại để trả về response (nếu mapper không load)
        // Nhưng vì mapper chạy trong @Transactional, nó sẽ load các set con
        return overviewPartMapper.toOverviewPartResponse(updatedPart);
    }

    // DELETE
    @Override
    @Transactional
    public void deleteOverviewPart(Long id) {
        OverviewPart overviewPart = findOverviewPartById(id);

        // Do 'cascade = CascadeType.ALL, orphanRemoval = true'
        // Xóa 'OverviewPart' sẽ tự động xóa tất cả các Exam liên quan
        overviewPartRepository.delete(overviewPart);
    }

    @Override
    public List<OverviewPartResponse> getOverviewPartByOverview(Long overviewId) {
        if (!overviewRepository.existsById(overviewId)) {
            throw new AppException(ErrorCode.OVERVIEW_NOT_FOUND);
        }

        List<OverviewPart> overviewParts = overviewPartRepository.findByOverviewId(overviewId);

        return overviewPartMapper.toOverviewPartResponseList(overviewParts);
    }

    // Hàm private helper
    private OverviewPart findOverviewPartById(Long id) {
        return overviewPartRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_PART_NOT_FOUND));
    }
}
