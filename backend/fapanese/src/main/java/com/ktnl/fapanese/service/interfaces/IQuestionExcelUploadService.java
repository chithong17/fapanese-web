package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.ExcelUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IQuestionExcelUploadService {
    ExcelUploadResponse processQuestionExcel(MultipartFile file) throws IOException;
}
