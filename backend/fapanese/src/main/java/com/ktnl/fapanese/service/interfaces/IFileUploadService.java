package com.ktnl.fapanese.service.interfaces;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IFileUploadService {
    String uploadFile(MultipartFile file, String folderName) throws IOException;
}
