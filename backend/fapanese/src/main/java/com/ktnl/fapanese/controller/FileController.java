package com.ktnl.fapanese.controller;


import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.service.interfaces.IFileUploadService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/files")
public class FileController {
    @Autowired
    private IFileUploadService iFileUploadService;

    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("folder") String folder) throws IOException { // 1. Ném lỗi nếu có

        String fileUrl = iFileUploadService.uploadFile(file, folder);

        return ApiResponse.<String>builder()
                .result(fileUrl)
                .build();
    }
}
