package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.CreateLecturerRequest;
import com.ktnl.fapanese.dto.request.LecturerPagingRequest;
import com.ktnl.fapanese.dto.response.CreateLecturerAccountResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.Role;
import com.ktnl.fapanese.entity.Lecturer;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.entity.enums.UserRole;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mail.AccountCreatedEmailTemplate;
import com.ktnl.fapanese.mail.RejectTeacherEmail;
import com.ktnl.fapanese.mail.TeacherApprovalEmail;
import com.ktnl.fapanese.mapper.UserMapper;
import com.ktnl.fapanese.repository.RoleRepository;
import com.ktnl.fapanese.repository.UserRepository;
import com.ktnl.fapanese.service.interfaces.IEmailService;
import com.ktnl.fapanese.service.interfaces.ILecturerService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LecturerService implements ILecturerService {
    UserRepository userRepo;
    RoleRepository roleRepo;
    UserMapper mapper;
    PasswordEncoder passwordEncoder;
    IEmailService emailService;

    @Override
    public CreateLecturerAccountResponse createLecturerAccount(CreateLecturerRequest createLecturerRequest) {
        Optional<User> existingUserOpt  = userRepo.findByEmail(createLecturerRequest.getEmail());

        if(existingUserOpt.isPresent())
            throw new AppException(ErrorCode.EMAIL_EXISTED);

        User user = mapper.toUser(createLecturerRequest);
        String randomPassword = generateRandomPassword(8);
        user.setPassword_hash(passwordEncoder.encode(randomPassword));
        Role role = roleRepo.findByRoleName(UserRole.LECTURER.name());
        user.setRoles(Set.of(role));
        user.setStatus(3);

        Lecturer lecturer = mapper.toLecturer(createLecturerRequest);
        lecturer.setUser(user);       // Quan hệ từ Lecturer -> User
        user.setTeacher(lecturer);    // Quan hệ ngược lại từ User -> Lecturer

        // 3. Chỉ cần LƯU USER MỘT LẦN DUY NHẤT ở cuối cùng
        // Do có CascadeType.ALL, JPA sẽ tự động lưu cả Lecturer/Lecturer liên quan
        emailService.sendEmail(createLecturerRequest.getEmail(), new AccountCreatedEmailTemplate(), createLecturerRequest.getEmail(), randomPassword);

        User savedUser = userRepo.save(user);


        // 4. Map từ đối tượng đã được lưu (có đầy đủ thông tin) và trả về
        return mapper.toLecturerRegisterRequest(createLecturerRequest);

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
    public Page<UserResponse> getAllLecturer(LecturerPagingRequest request) {

        // 1. Lấy Pageable trực tiếp từ hàm tiện ích trong BaseSearchRequest
        // (Không cần viết logic if-else check sortDir ở đây nữa)
        Pageable pageable = request.getPageable();

        // 2. Gọi Repo
        // Lấy các tham số filter từ getter của request
        Page<User> userPage = userRepo.getLecturers(
                "LECTURER",
                request.getExpertise(),
                request.getStatus(),
                request.getKeyword(),
                pageable
        );

        // 3. Map sang Response
        return userPage.map(mapper::toUserResponse);
    }

    @Override
    public UserResponse getLecturerByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        validateLecturerRole(user);
        return mapper.toUserResponse(user);
    }

    @Override
    public UserResponse updateLecturer(String email, CreateLecturerRequest lecturerUpdateRequest) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        validateLecturerRole(user);

        // cập nhật thông tin sinh viên
        user.getTeacher().setFirstName(lecturerUpdateRequest.getFirstName());
        user.getTeacher().setLastName(lecturerUpdateRequest.getLastName());
        user.getTeacher().setExpertise(lecturerUpdateRequest.getExpertise());
        user.getTeacher().setDateOfBirth(lecturerUpdateRequest.getDateOfBirth());
        user.setStatus(lecturerUpdateRequest.getStatus());

        userRepo.save(user);
        return mapper.toUserResponse(user);
    }

    @Override
    public void deleteLecturer(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        validateLecturerRole(user); // vẫn giữ để tránh lỡ xóa user khác role

        // ✅ Xóa cứng
        userRepo.delete(user);
    }

    private void validateLecturerRole(User user) {
        boolean isLecturer = user.getRoles().stream()
                .anyMatch(r -> r.getRoleName().equals("LECTURER"));
        if (!isLecturer)
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
    }

    @Override
    public List<UserResponse> getPendingTeachers() {
        return userRepo.findByRoles_RoleName("LECTURER").stream()
                .filter(u -> u.getStatus() == 2)
                .map(mapper::toUserResponse)   // ✅ map sang DTO trả về cho FE
                .toList();
    }

    @Override
    @Transactional
    public UserResponse updateStatusById(String userId, int status) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getTeacher() != null) {
            String fullName = user.getTeacher().getFirstName() + " " + user.getTeacher().getLastName();

            if (status == 3) {
                user.setStatus(3);
                userRepo.save(user);
                emailService.sendEmail(user.getEmail(), new TeacherApprovalEmail(), fullName);
                log.info("✅ Approved teacher and sent mail to {}", user.getEmail());
            }

            else if (status == -1) {
                emailService.sendEmail(user.getEmail(), new RejectTeacherEmail(), fullName);
                log.info("📧 Sent rejection mail to {}", user.getEmail());

                userRepo.delete(user); // Xóa cả user và lecturer (cascade)
                log.info("🗑️ Deleted rejected teacher {}", user.getEmail());

                return UserResponse.builder()
                        .email(user.getEmail())
                        .role("LECTURER")
                        .build();
            }
        }
        else {
            user.setStatus(status);
            userRepo.save(user);
            log.info("Updated status {} for non-teacher user {}", status, user.getEmail());
        }

        return mapper.toUserResponse(user);
    }
}
