package com.ktnl.fapanese.service;

import com.ktnl.fapanese.repository.LecturerRepository;
import com.ktnl.fapanese.repository.RoleRepository;
import com.ktnl.fapanese.repository.StudentRepository;
import com.ktnl.fapanese.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private LecturerRepository lecturerRepo;
    @Autowired
    private StudentRepository studentRepo;
    @Autowired
    private RoleRepository roleRepo;


}
