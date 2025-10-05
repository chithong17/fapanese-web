package com.ktnl.fapanese.configuration;

import com.ktnl.fapanese.entity.Role;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;


    //sẽ đc chạy mỗi khi application start
    @Bean
    //điều kiện để chạy
    @ConditionalOnProperty(prefix = "spring",
            value = "datasource.driverClassName",
            havingValue = "com.mysql.cj.jdbc.Driver")
    ApplicationRunner applicationRunner(UserRepository userRepository){
        return args -> {
            if(userRepository.findByEmail("fapanese.edu@gmail.com").isEmpty()){
                HashSet<Role> roles = new HashSet<>();
                roles.add(Role.builder().id(3).roleName("ADMIN").build());
                User user = User.builder()
                        .email("fapanese.edu@gmail.com")
                        .password_hash(passwordEncoder.encode("Fapanese@2025!"))
                        .roles(roles)
                        .status(3)
                        .build();

                userRepository.save(user);
                log.warn("Admin user has been creation with default password: admin, please change it");
            }
        };
    }

}
