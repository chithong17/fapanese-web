package com.ktnl.fapanese.mappper;

import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.Lecturer;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "password_hash", source = "password")
    User toUser(UserRequest request);

    @Mapping(source = "firstName", target = "firstName")
    @Mapping(source = "lastName", target = "lastName")
    @Mapping(
            target = "dateOfBirth",
            expression = "java(request.getDateOfBirth() == null ? null : java.time.LocalDate.parse(request.getDateOfBirth(), java.time.format.DateTimeFormatter.ofPattern(\"yyyy-MM-dd\")))"
    )
    Student toStudent(UserRequest request);

    @Mapping(source = "firstName", target = "firstName")
    @Mapping(source = "lastName", target = "lastName")
    @Mapping(
            target = "dateOfBirth",
            expression = "java(request.getDateOfBirth() == null ? null : java.time.LocalDate.parse(request.getDateOfBirth(), java.time.format.DateTimeFormatter.ofPattern(\"yyyy-MM-dd\")))"
    )
    Lecturer toLecturer(UserRequest request);


    @Mapping(expression = "java(user.getRoles().stream().findFirst().map(r -> r.getRoleName()).orElse(null))", target = "role")
    @Mapping(source = "teacher.expertise", target = "expertise")
    @Mapping(source = "teacher.bio", target = "bio")
    @Mapping(source = "teacher.dateOfBirth", target = "teacherDateOfBirth")
    @Mapping(source = "student.campus", target = "campus")
    @Mapping(source = "student.dateOfBirth", target = "studentDateOfBirth")
    UserResponse toUserResponse(User user);
}
