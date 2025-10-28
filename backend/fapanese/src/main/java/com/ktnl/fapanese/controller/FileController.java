package com.ktnl.fapanese.controller;


import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.service.interfaces.IFileUploadService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

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

    @DeleteMapping("/delete-by-url")
    public ApiResponse<Map> deleteFileByUrl(@RequestParam("fileUrl") String fileUrl) {
        log.info("Receiving request to delete file by URL: {}", fileUrl);
        Map result = iFileUploadService.deleteFile(fileUrl);
        log.info("Cloudinary deletion result: {}", result);

        // Kiểm tra kết quả trả về từ service (có thể là "ok", "not found", "ok_skipped", "error_parsing_id")
        String cloudinaryResult = (String) result.getOrDefault("result", "error");

        return ApiResponse.<Map>builder()
                        .result(result) // Trả về kết quả từ Cloudinary
                        .message("File deletion request processed. Result: " + cloudinaryResult)
                        .build();

    }


}
