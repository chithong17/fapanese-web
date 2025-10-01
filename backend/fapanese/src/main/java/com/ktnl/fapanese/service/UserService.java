package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.Lecturer;
import com.ktnl.fapanese.entity.Role;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.mappper.UserMapper;
import com.ktnl.fapanese.repository.LecturerRepository;
import com.ktnl.fapanese.repository.RoleRepository;
import com.ktnl.fapanese.repository.StudentRepository;
import com.ktnl.fapanese.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

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


    PasswordEncoder passwordEncoder;

    public UserResponse registerUser(UserRequest userRequest) {
        User user = mapper.toUser(userRequest);

        user.setPassword_hash(passwordEncoder.encode(user.getPassword_hash()));

        Role role = roleRepo.findByRoleName(userRequest.getRole());
        user.setRoles(Set.of(role));

        userRepo.save(user);

        if("LECTURER".equalsIgnoreCase(userRequest.getRole())){
            Lecturer lecturer = mapper.toLecturer(userRequest);
            lecturer.setUser(user);
            lecturerRepo.save(lecturer);
        }
        else if("STUDENT".equalsIgnoreCase(userRequest.getRole())){
            Student student = mapper.toStudent(userRequest);
            student.setUser(user);
            studentRepo.save(student);
        }

        return mapper.toUserResponse(user);
    }
}
