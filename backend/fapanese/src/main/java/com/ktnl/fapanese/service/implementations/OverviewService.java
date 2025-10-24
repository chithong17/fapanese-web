package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.OverviewRequest;
import com.ktnl.fapanese.dto.response.LessonRespone;
import com.ktnl.fapanese.dto.response.OverviewResponse;
import com.ktnl.fapanese.entity.Course;
import com.ktnl.fapanese.entity.Lesson;
import com.ktnl.fapanese.entity.Overview;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.LessonMapper;
import com.ktnl.fapanese.mapper.OverviewMapper;
import com.ktnl.fapanese.repository.CourseRepository;
import com.ktnl.fapanese.repository.OverviewRepository;
import com.ktnl.fapanese.service.interfaces.IOverviewService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OverviewService implements IOverviewService {

    OverviewRepository overviewRepository;
    CourseRepository courseRepository; // Dependency
    OverviewMapper overviewMapper;

    // READ (All)
    @Override
    public List<OverviewResponse> getAllOverviews() {
        List<Overview> overviews = overviewRepository.findAll();
        return overviewMapper.toOverviewResponseList(overviews);
    }

    // READ (By Id)
    @Override
    public OverviewResponse getOverviewById(Long id) {
        Overview overview = findOverviewById(id);
        return overviewMapper.toOverviewResponse(overview);
    }

    // CREATE
    @Override
    @Transactional
    public OverviewResponse createOverview(OverviewRequest request) {
        Overview overview = overviewMapper.toOverview(request);

        // Xử lý quan hệ ManyToOne
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        overview.setCourse(course);

        Overview savedOverview = overviewRepository.save(overview);
        return overviewMapper.toOverviewResponse(savedOverview);
    }

    // UPDATE
    @Override
    @Transactional
    public OverviewResponse updateOverview(Long id, OverviewRequest request) {
        Overview existingOverview = findOverviewById(id);

        // Cập nhật các trường cơ bản (title, description)
        overviewMapper.updateOverview(existingOverview, request);

        // Cập nhật quan hệ ManyToOne (nếu ID course thay đổi)
        if (!existingOverview.getCourse().getId().equals(request.getCourseId())) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
            existingOverview.setCourse(course);
        }

        Overview updatedOverview = overviewRepository.save(existingOverview);
        return overviewMapper.toOverviewResponse(updatedOverview);
    }

    // DELETE
    @Override
    @Transactional
    public void deleteOverview(Long id) {
        Overview overview = findOverviewById(id);
        // Do có 'cascade = CascadeType.ALL, orphanRemoval = true'
        // Xóa 'Overview' sẽ tự động xóa tất cả 'OverviewPart' liên quan
        overviewRepository.delete(overview);
    }

    @Override
    public List<OverviewResponse> getAllOverviewsByCourseCode(String courseCode) {
        Course course = courseRepository.findByCode(courseCode)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        return overviewMapper.toOverviewResponseList(new ArrayList<>(course.getOverviews()));
    }


    // Hàm private helper
    private Overview findOverviewById(Long id) {
        return overviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OVERVIEW_NOT_FOUND));
    }
}
