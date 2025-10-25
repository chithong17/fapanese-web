package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.GrammarRequest;
import com.ktnl.fapanese.dto.request.LecturerRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.LecturerRespone;
import com.ktnl.fapanese.service.interfaces.ILecturerService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lecturers")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LecturerController {
    private final ILecturerService lecturerService;

    @GetMapping
    public ApiResponse<List<LecturerRespone>> getAllLecturers(){
        List<LecturerRespone> result = lecturerService.getAllLecturers();
        return ApiResponse.<List<LecturerRespone>>builder()
                .result(result)
                .message("Get all Lecturers success")
                .build();
    }

    @GetMapping("/{lecturerId}")
    public  ApiResponse<LecturerRespone> getLecturer(@PathVariable("lecturerId") String id){
        LecturerRespone result = lecturerService.getLecturer(id);
        return ApiResponse.<LecturerRespone>builder()
                .result(result)
                .message("Get Lecturer success")
                .build();
    }

    @DeleteMapping("/{lecturerId}")
    public ApiResponse<Void> deleteLecturer(@PathVariable("lecturerId") String id){
        lecturerService.deleteLecturer(id);
        return ApiResponse.<Void>builder()
                .message("Delete Lecturer success")
                .build();
    }

    @PostMapping
    public ApiResponse<LecturerRespone> createLecturer(@RequestBody LecturerRequest request){
        LecturerRespone result = lecturerService.createLecturer(request);
        return ApiResponse.<LecturerRespone>builder()
                .result(result)
                .message("Create lecturer success")
                .build();
    }

    @PutMapping("/{lecturerId}")
    public ApiResponse<LecturerRespone> updateLecturer(@PathVariable("lecturerId") String lecturerId, @RequestBody LecturerRequest request){
        LecturerRespone result = lecturerService.updateLecturer(lecturerId, request);
        return ApiResponse.<LecturerRespone>builder()
                .result(result)
                .message("Update lecturer success")
                .build();
    }
}
