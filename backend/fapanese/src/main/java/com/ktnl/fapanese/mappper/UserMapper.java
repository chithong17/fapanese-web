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


    @Mapping(
            expression = "java(user.getStudent() != null ? user.getStudent().getFirstName() : (user.getTeacher() != null ? user.getTeacher().getFirstName() : null))",
            target = "firstName"
    )
    @Mapping(
            expression = "java(user.getStudent() != null ? user.getStudent().getLastName() : (user.getTeacher() != null ? user.getTeacher().getLastName() : null))",
            target = "lastName"
    )
    @Mapping(
            expression = "java(user.getStudent() != null ? user.getStudent().getDateOfBirth() : (user.getTeacher() != null ? user.getTeacher().getDateOfBirth() : null))",
            target = "dob"
    )
    @Mapping(
            expression = "java(user.getStudent() != null ? user.getStudent().getCampus() : null)",
            target = "campus"
    )
    @Mapping(
            expression = "java(user.getTeacher() != null ? user.getTeacher().getExpertise() : null)",
            target = "expertise"
    )
    @Mapping(
            expression = "java(user.getTeacher() != null ? user.getTeacher().getBio() : null)",
            target = "bio"
    )
    UserResponse toUserResponse(User user);
}
