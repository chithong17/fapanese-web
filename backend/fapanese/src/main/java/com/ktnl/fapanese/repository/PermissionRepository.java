package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission,Long> {
}
