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
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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
        log.info("Register request payload: {}", userRequest);
        Optional<User> existingUserOpt  = userRepo.findByEmail(userRequest.getEmail());

        if(existingUserOpt.isPresent())
            throw new AppException(ErrorCode.EMAIL_EXISTED);

        // 1. Chuẩn bị đối tượng User trong bộ nhớ
        User user = mapper.toUser(userRequest);
        user.setPassword_hash(passwordEncoder.encode(userRequest.getPassword())); // Nên lấy pass từ request
        Role role = roleRepo.findByRoleName(userRequest.getRole());
        user.setRoles(Set.of(role));
        user.setStatus(0);

        // 2. Chuẩn bị đối tượng Lecturer hoặc Student và thiết lập quan hệ 2 chiều
        if("LECTURER".equalsIgnoreCase(userRequest.getRole())){
            Lecturer lecturer = mapper.toLecturer(userRequest);
            lecturer.setUser(user);      // Quan hệ từ Lecturer -> User
            lecturer.setAvtUrl("https://drive.google.com/file/d/1KZJdE58UiYN8UjoZ0y7wUw0Ptge8FZ0i/view?usp=drive_link");
            user.setTeacher(lecturer);   // Quan hệ ngược lại từ User -> Lecturer
        }
        else if("STUDENT".equalsIgnoreCase(userRequest.getRole())){
            Student student = mapper.toStudent(userRequest);
            student.setUser(user);       // Quan hệ từ Student -> User
            student.setAvtUrl("https://drive.google.com/file/d/1KZJdE58UiYN8UjoZ0y7wUw0Ptge8FZ0i/view?usp=drive_link");
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
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRoles()
                        .stream()
                        .map(Role::getRoleName)
                        .collect(Collectors.joining(",")));


        // Nếu là student
        if (user.getStudent() != null) {
            builder.dateOfBirth(user.getStudent().getDateOfBirth())
                    .campus(user.getStudent().getCampus())
                    .firstName(user.getStudent().getFirstName())
                    .lastName(user.getStudent().getLastName());
        }

        // Nếu là lecturer
        if (user.getTeacher() != null) {
            builder.dateOfBirth(user.getTeacher().getDateOfBirth())
                    .expertise(user.getTeacher().getExpertise())
                    .bio(user.getTeacher().getBio())
                    .firstName(user.getTeacher().getFirstName())
                    .lastName(user.getTeacher().getLastName());
        }

        return builder.build();
    }

    public UserResponse updateUserProfile(UserRequest userRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setEmail(userRequest.getEmail());

        Role role = roleRepo.findByRoleName(userRequest.getRole());
        if(role == null){
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
        if (user.getRoles() == null) {
            user.setRoles(new HashSet<>());
        } else {
            user.getRoles().clear(); // nếu bạn muốn hoàn toàn thay mới
        }
        user.getRoles().add(role);

        if ("STUDENT".equalsIgnoreCase(userRequest.getRole())) {
            Student student = user.getStudent(); // LẤY student hiện có (nếu có)
            if (student == null) {
                // tạo mới và gắn hai chiều
                student = mapper.toStudent(userRequest); // có thể dùng mapper
                student.setUser(user);
                user.setStudent(student);
            } else {
                // update các field trên student hiện có
                student.setFirstName(userRequest.getFirstName());
                student.setLastName(userRequest.getLastName());
                student.setCampus(userRequest.getCampus());
                student.setDateOfBirth(userRequest.getDateOfBirth());
            }
        }

        if ("LECTURER".equalsIgnoreCase(userRequest.getRole())) {
            // LẤY lecturer hiện tại được liên kết với user (nếu có)
            Lecturer lecturer = user.getTeacher();

            if (lecturer == null) {
                // chưa có -> tạo mới từ mapper hoặc thủ công, gán hai chiều
                lecturer = mapper.toLecturer(userRequest); // mới được map từ request
                lecturer.setUser(user);
                user.setTeacher(lecturer);
            } else {
                // đã có -> cập nhật trực tiếp lên object đã liên kết
                lecturer.setFirstName(userRequest.getFirstName());
                lecturer.setLastName(userRequest.getLastName());
                lecturer.setBio(userRequest.getBio());
                lecturer.setExpertise(userRequest.getExpertise());
                lecturer.setDateOfBirth(userRequest.getDateOfBirth()); // hoặc dùng parse an toàn
            }
        }

        User savedUser = userRepo.save(user);
        return mapper.toUserResponse(savedUser);

    }

    public void updateStatusUserAfterVerifyOtp(String email){
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(user.getTeacher() != null)
            user.setStatus(2);
        else if(user.getStudent() != null)
            user.setStatus(3);

        userRepo.save(user);
    }

    @Transactional
    public void deleteUserByEmail(String email) {
        if (userRepo.findByEmail(email).isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }
        userRepo.deleteByEmail(email);
    }
}
