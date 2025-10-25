package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.OverviewPartRequest;
import com.ktnl.fapanese.dto.response.LessonPartSimpleResponse;
import com.ktnl.fapanese.dto.response.OverviewPartResponse;

import java.util.List;

public interface IOverviewPartService {
    List<OverviewPartResponse> getAllOverviewParts();

    OverviewPartResponse getOverviewPartById(Long id);

    OverviewPartResponse createOverviewPart(OverviewPartRequest request);

    OverviewPartResponse updateOverviewPart(Long id, OverviewPartRequest request);

    void deleteOverviewPart(Long id);

    List<OverviewPartResponse> getOverviewPartByOverview(Long overviewId);
}
