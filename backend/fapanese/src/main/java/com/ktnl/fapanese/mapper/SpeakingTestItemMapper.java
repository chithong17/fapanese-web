package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.response.SpeakingRespone;
import com.ktnl.fapanese.dto.response.SpeakingTestItemResponse;
import com.ktnl.fapanese.entity.Speaking;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SpeakingTestItemMapper {
    SpeakingTestItemResponse toSpeakingTestItemResponse(Speaking speaking);
}
