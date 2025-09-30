package com.ktnl.fapanese.mappper;

import com.ktnl.fapanese.dto.request.RegisterRequest;
import com.ktnl.fapanese.entity.Lecturer;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RegisterMapper {
    @Mapping(target = "password_hash", source = "password")
    User toUser(RegisterRequest request);

    @Mapping(target = "dateOfBirth", expression = "java(java.time.LocalDate.parse(request.getDateOfBirth()))")
    Lecturer toLecturer(RegisterRequest request);

    @Mapping(target = "dateOfBirth", expression = "java(java.time.LocalDate.parse(request.getDateOfBirth()))")
    Student toStudent(RegisterRequest request);
}
