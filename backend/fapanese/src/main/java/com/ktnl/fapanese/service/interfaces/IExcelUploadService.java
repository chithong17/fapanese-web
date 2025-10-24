package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.ExcelUploadResponse;
import com.ktnl.fapanese.exception.AppException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IExcelUploadService {
    ExcelUploadResponse processStudentExcel(MultipartFile file) throws IOException, AppException;
}
