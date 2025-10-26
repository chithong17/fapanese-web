package com.ktnl.fapanese.repository;

import com.ktnl.fapanese.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByLecturerId(String lecturerId);
}
