package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.OverviewPartRequest;
import com.ktnl.fapanese.dto.response.OverviewPartResponse;
import com.ktnl.fapanese.entity.OverviewPart;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;


@Mapper(componentModel = "spring")
public interface OverviewPartMapper {

    // 1. Map từ Request DTO -> Entity (TẠO MỚI)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overview", ignore = true) // Set trong Service
    @Mapping(target = "speakingExams", ignore = true) // ✅ Sửa lỗi: Bỏ qua mối quan hệ
    @Mapping(target = "finalExams", ignore = true)    // ✅ Sửa lỗi: Bỏ qua mối quan hệ
    @Mapping(target = "middleExams", ignore = true)   // ✅ Sửa lỗi: Bỏ qua mối quan hệ
    OverviewPart toOverviewPart(OverviewPartRequest request);

    // 2. Map từ Entity -> Response DTO (TRẢ VỀ)
    @Mapping(target = "overviewId", source = "overview.id")
    OverviewPartResponse toOverviewPartResponse(OverviewPart overviewPart);

    // 3. CẬP NHẬT Entity có sẵn từ Request DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "overview", ignore = true)
    @Mapping(target = "speakingExams", ignore = true) // ✅ Sửa lỗi: Bỏ qua mối quan hệ
    @Mapping(target = "finalExams", ignore = true)    // ✅ Sửa lỗi: Bỏ qua mối quan hệ
    @Mapping(target = "middleExams", ignore = true)   // ✅ Sửa lỗi: Bỏ qua mối quan hệ
    void updateOverviewPart(@MappingTarget OverviewPart overviewPart, OverviewPartRequest request);

    // 4. Map List
    List<OverviewPartResponse> toOverviewPartResponseList(List<OverviewPart> overviewParts);
}