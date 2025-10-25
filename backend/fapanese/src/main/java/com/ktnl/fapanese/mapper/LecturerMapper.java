package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.LecturerRequest;
import com.ktnl.fapanese.dto.response.LecturerRespone;
import com.ktnl.fapanese.entity.Lecturer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LecturerMapper {

    LecturerRespone toLecturerRespone(Lecturer lecturer);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avtUrl", ignore = true)
    @Mapping(target = "user", ignore = true)

    Lecturer toLecturer(LecturerRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avtUrl", ignore = true)
    @Mapping(target = "user", ignore = true)

    void updateLecturer(@MappingTarget Lecturer lecturer, LecturerRequest request);
}
