package com.ktnl.fapanese.service.interfaces;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface IFileUploadService {
    String uploadFile(MultipartFile file, String folderName);
    Map deleteFile(String fileUrl);
}
