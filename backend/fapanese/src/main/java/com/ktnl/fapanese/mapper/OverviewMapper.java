package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.OverviewRequest;
import com.ktnl.fapanese.dto.response.OverviewResponse;
import com.ktnl.fapanese.entity.Overview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OverviewMapper {

    // 1. Map từ Request DTO -> Entity (TẠO MỚI)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "overviewParts", ignore = true) // ✅ Sửa lỗi: Bỏ qua mối quan hệ OverviewParts
    Overview toOverview(OverviewRequest request);

    // 2. Map từ Entity -> Response DTO (TRẢ VỀ)
    // KHÔNG cần ignore cho toOverviewResponse vì nó ánh xạ từ Entity ra DTO.
    @Mapping(target = "courseId", source = "course.id")
    OverviewResponse toOverviewResponse(Overview overview);

    // 3. CẬP NHẬT Entity có sẵn từ Request DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "overviewParts", ignore = true) // ✅ Sửa lỗi: Bỏ qua mối quan hệ OverviewParts
    void updateOverview(@MappingTarget Overview overview, OverviewRequest request);

    // 4. Map List
    List<OverviewResponse> toOverviewResponseList(List<Overview> overviews);
}