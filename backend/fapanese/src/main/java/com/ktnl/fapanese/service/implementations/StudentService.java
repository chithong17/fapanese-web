package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.CreateStudentRequest;
import com.ktnl.fapanese.dto.response.CreateStudentAccountResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.Role;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.entity.enums.UserRole;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mail.AccountCreatedEmailTemplate;
import com.ktnl.fapanese.mapper.UserMapper;
import com.ktnl.fapanese.repository.RoleRepository;
import com.ktnl.fapanese.repository.UserRepository;
import com.ktnl.fapanese.service.interfaces.IStudentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StudentService implements IStudentService {
    UserRepository userRepo;
    RoleRepository roleRepo;
    UserMapper mapper;
    PasswordEncoder passwordEncoder;
    EmailService emailService;

    @Override
    public CreateStudentAccountResponse createStudentAccount(CreateStudentRequest createStudentRequest) {
        Optional<User> existingUserOpt  = userRepo.findByEmail(createStudentRequest.getEmail());

        if(existingUserOpt.isPresent())
            throw new AppException(ErrorCode.EMAIL_EXISTED);

        User user = mapper.toUser(createStudentRequest);
        String randomPassword = generateRandomPassword(8);
        user.setPassword_hash(passwordEncoder.encode(randomPassword));
        Role role = roleRepo.findByRoleName(UserRole.STUDENT.name());
        user.setRoles(Set.of(role));
        user.setStatus(0);

        Student student = mapper.toStudent(createStudentRequest);
        student.setUser(user);       // Quan hệ từ Student -> User
//        student.setAvtUrl("https://drive.google.com/file/d/1KZJdE58UiYN8UjoZ0y7wUw0Ptge8FZ0i/view?usp=drive_link");
        user.setStudent(student);    // Quan hệ ngược lại từ User -> Student

        // 3. Chỉ cần LƯU USER MỘT LẦN DUY NHẤT ở cuối cùng
        // Do có CascadeType.ALL, JPA sẽ tự động lưu cả Lecturer/Student liên quan
        User savedUser = userRepo.save(user);

        emailService.sendEmail(savedUser.getEmail(), new AccountCreatedEmailTemplate(), savedUser.getEmail(), randomPassword);

        // 4. Map từ đối tượng đã được lưu (có đầy đủ thông tin) và trả về
        return mapper.toStudentRegisterRequest(createStudentRequest);

    }

    @Override
    public boolean createStudentAccountList(List<CreateStudentRequest> list){
        for(CreateStudentRequest request : list){
            createStudentAccount(request);
        }
        return true;
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Override
    public List<UserResponse> getAllStudent() {
        List<User> userList = userRepo.findByRoles_RoleName("STUDENT");
        List<UserResponse> userResponseList = new ArrayList<>();
        for(User x : userList){
            userResponseList.add(mapper.toUserResponse(x));
        }
        return userResponseList;
    }

    @Override
    public UserResponse getStudentByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        validateStudentRole(user);
        return mapper.toUserResponse(user);
    }

    @Override
    public UserResponse updateStudent(String email, CreateStudentRequest studentUpdateRequest) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_ISACTIVED));

        validateStudentRole(user);

        // cập nhật thông tin sinh viên
        user.getStudent().setFirstName(studentUpdateRequest.getFirstName());
        user.getStudent().setLastName(studentUpdateRequest.getLastName());
        user.getStudent().setCampus(studentUpdateRequest.getCampus());
        user.getStudent().setDateOfBirth(studentUpdateRequest.getDateOfBirth());

        userRepo.save(user);
        return mapper.toUserResponse(user);
    }

    @Override
    public void deleteStudent(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        validateStudentRole(user); // vẫn giữ để tránh lỡ xóa user khác role

        // ✅ Xóa cứng
        userRepo.delete(user);
    }

    private void validateStudentRole(User user) {
        boolean isStudent = user.getRoles().stream()
                .anyMatch(r -> r.getRoleName().equals("STUDENT"));
        if (!isStudent)
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
    }
}
