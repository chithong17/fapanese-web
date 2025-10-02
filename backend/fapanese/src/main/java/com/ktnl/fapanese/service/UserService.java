package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.Lecturer;
import com.ktnl.fapanese.entity.Role;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mappper.UserMapper;
import com.ktnl.fapanese.repository.LecturerRepository;
import com.ktnl.fapanese.repository.RoleRepository;
import com.ktnl.fapanese.repository.StudentRepository;
import com.ktnl.fapanese.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Slf4j
@Service
public class UserService {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private LecturerRepository lecturerRepo;
    @Autowired
    private StudentRepository studentRepo;
    @Autowired
    private RoleRepository roleRepo;
    @Autowired
    private UserMapper mapper;
    @Autowired
    PasswordEncoder passwordEncoder;

    public UserResponse registerUser(UserRequest userRequest) {
        if(userRepo.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        // 1. Chuẩn bị đối tượng User trong bộ nhớ
        User user = mapper.toUser(userRequest);
        user.setPassword_hash(passwordEncoder.encode(userRequest.getPassword())); // Nên lấy pass từ request
        Role role = roleRepo.findByRoleName(userRequest.getRole());
        user.setRoles(Set.of(role));

        // 2. Chuẩn bị đối tượng Lecturer hoặc Student và thiết lập quan hệ 2 chiều
        if("LECTURER".equalsIgnoreCase(userRequest.getRole())){
            Lecturer lecturer = mapper.toLecturer(userRequest);
            lecturer.setUser(user);      // Quan hệ từ Lecturer -> User
            user.setTeacher(lecturer);   // Quan hệ ngược lại từ User -> Lecturer
        }
        else if("STUDENT".equalsIgnoreCase(userRequest.getRole())){
            Student student = mapper.toStudent(userRequest);
            student.setUser(user);       // Quan hệ từ Student -> User
            user.setStudent(student);    // Quan hệ ngược lại từ User -> Student
        }

        // 3. Chỉ cần LƯU USER MỘT LẦN DUY NHẤT ở cuối cùng
        // Do có CascadeType.ALL, JPA sẽ tự động lưu cả Lecturer/Student liên quan
        User savedUser = userRepo.save(user);

        // 4. Map từ đối tượng đã được lưu (có đầy đủ thông tin) và trả về
        return mapper.toUserResponse(savedUser);
    }

    public UserResponse getCurrentUserProfile() {
        // Lấy thông tin Authentication từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Lấy user từ DB theo email
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRoles()
                        .stream()
                        .map(Role::getRoleName)
                        .toList().toString());


        // Nếu là student
        if (user.getStudent() != null) {
            builder.studentDateOfBirth(user.getStudent().getDateOfBirth())
                    .campus(user.getStudent().getCampus())
                    .studentFirstname(user.getStudent().getFirstName())
                    .studentLastname(user.getStudent().getLastName());
        }

        // Nếu là lecturer
        if (user.getTeacher() != null) {
            builder.teacherDateOfBirth(user.getTeacher().getDateOfBirth())
                    .expertise(user.getTeacher().getExpertise())
                    .bio(user.getTeacher().getBio())
                    .teacherFirstname(user.getTeacher().getFirstName())
                    .teacherLastname(user.getTeacher().getLastName());
        }

        return builder.build();
    }
}
