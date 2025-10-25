package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.CreateStudentRequest;
import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.CreateStudentAccountResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.Lecturer;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // 1️⃣ Map UserRequest -> User
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "teacher", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password_hash", source = "password")
    User toUser(UserRequest request);

    // 2️⃣ Map CreateStudentRequest -> User (nếu không có password)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "teacher", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password_hash", ignore = true)
    User toUser(CreateStudentRequest request);

    // 3️⃣ Map UserRequest -> Student
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avtUrl", ignore = true)
    @Mapping(target = "user", ignore = true)
    Student toStudent(UserRequest request);

    // 4️⃣ Map CreateStudentRequest -> Student
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avtUrl", ignore = true)
    @Mapping(target = "user", ignore = true)
    Student toStudent(CreateStudentRequest request);

    // 5️⃣ Map UserRequest -> Lecturer
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "avtUrl", ignore = true)
    @Mapping(target = "user", ignore = true)
    Lecturer toLecturer(UserRequest request);

    // 6️⃣ Map User -> UserResponse (vừa cho Lecturer vừa cho Student)
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
            target = "dateOfBirth"
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

    // 7️⃣ Dành cho tạo tài khoản học viên
    CreateStudentAccountResponse toStudentRegisterRequest(CreateStudentRequest createStudentRequest);
}
