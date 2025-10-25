package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.LecturerRequest;
import com.ktnl.fapanese.dto.response.LecturerRespone;
import com.ktnl.fapanese.entity.ClassCourse;
import com.ktnl.fapanese.entity.Lecturer;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.LecturerMapper;
import com.ktnl.fapanese.repository.LecturerRepository;
import com.ktnl.fapanese.service.interfaces.ILecturerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LecturerService implements ILecturerService{
    LecturerMapper lecturerMapper;
    LecturerRepository lecturerRepository;


    @Override
    public LecturerRespone createLecturer(LecturerRequest request) {
        Lecturer newLecturer = lecturerMapper.toLecturer(request);

        // Basic validation
        if (newLecturer.getFirstName() == null || newLecturer.getFirstName().trim().isEmpty()
                || newLecturer.getLastName() == null || newLecturer.getLastName().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_LECTURER_NAME);
        }

        // Save and return response
        Lecturer saved = lecturerRepository.save(newLecturer);
        return lecturerMapper.toLecturerRespone(saved);
    }

    @Override
    public List<LecturerRespone> getAllLecturers() {
        return lecturerRepository.findAll().stream()
                .map(lecturerMapper::toLecturerRespone)
                .collect(Collectors.toList());
    }

    @Override
    public LecturerRespone getLecturer(String id) {
        Lecturer lecturer = lecturerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LECTURER_NOT_FOUND));
        return lecturerMapper.toLecturerRespone(lecturer);
    }

    @Override
    public LecturerRespone updateLecturer(String id, LecturerRequest request) {
        Lecturer existing = lecturerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LECTURER_NOT_FOUND));

        if(request.getFirstName() != null) existing.setFirstName(request.getFirstName());
        if(request.getLastName() != null) existing.setLastName(request.getLastName());
        if(request.getExpertise() != null) existing.setExpertise(request.getExpertise());
        if(request.getBio() != null) existing.setBio(request.getBio());
        if(request.getAvtUrl() != null) existing.setAvtUrl(request.getAvtUrl());
        if(request.getDateOfBirth() != null) existing.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));

        Lecturer updated = lecturerRepository.save(existing);
        return lecturerMapper.toLecturerRespone(updated);

    }

    @Override
    public void deleteLecturer(String id) {
        lecturerRepository.deleteById(id);
    }
}
