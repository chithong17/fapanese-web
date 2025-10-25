package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.LecturerRequest;
import com.ktnl.fapanese.dto.response.LecturerRespone;
import com.ktnl.fapanese.entity.Lecturer;

import java.util.List;

public interface ILecturerService {
    LecturerRespone createLecturer(LecturerRequest request);
    List<LecturerRespone> getAllLecturers();
    LecturerRespone getLecturer(String id);
    LecturerRespone updateLecturer(String id ,LecturerRequest request);
    void  deleteLecturer(String id);
}
