package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Long> {
}
