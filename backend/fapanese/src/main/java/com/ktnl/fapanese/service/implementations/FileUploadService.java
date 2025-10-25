package com.ktnl.fapanese.service.implementations;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.service.interfaces.IFileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class FileUploadService implements IFileUploadService{

    @Autowired
    private Cloudinary cloudinary;

    // Sửa hàm này: Thêm một tham số "String folderName"
    @Override
    public String uploadFile(MultipartFile file, String folderName) throws IOException, IOException {

        if(file.isEmpty())
            throw new AppException(ErrorCode.FILE_REQUIRED);

        // Nếu folderName bị rỗng, đặt một thư mục mặc định
        if (folderName == null || folderName.isEmpty()) {
            folderName = "fapanese/others"; // Thư mục dự phòng
        }

        Map options = ObjectUtils.asMap(
                // Dùng biến "folderName" động ở đây
                "folder", folderName,
                "resource_type", "auto"
        );

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);

        return uploadResult.get("secure_url").toString();
    }
}
