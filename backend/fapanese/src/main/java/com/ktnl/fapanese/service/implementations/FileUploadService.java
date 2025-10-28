package com.ktnl.fapanese.service.implementations;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.service.interfaces.IFileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FileUploadService implements IFileUploadService{

    @Autowired
    private Cloudinary cloudinary;

    // Sửa hàm này: Thêm một tham số "String folderName"
    @Override
    public String uploadFile(MultipartFile file, String folderName) {
        try {
            // 1️⃣ Kiểm tra file rỗng
            if (file == null || file.isEmpty()) {
                throw new AppException(ErrorCode.FILE_REQUIRED);
            }

            // 2️⃣ Nếu folderName rỗng => dùng thư mục mặc định
            if (folderName == null || folderName.isBlank()) {
                folderName = "fapanese/others";
            }

            // 3️⃣ Chuẩn bị options upload
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", folderName,
                    "resource_type", "auto"
            );

            // 4️⃣ Upload lên Cloudinary
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);

            // 5️⃣ Trả về secure URL
            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            // Lỗi đọc file
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED, "Lỗi đọc file: " + e.getMessage());
        } catch (MaxUploadSizeExceededException e) {
            // Lỗi từ phía Cloudinary
            throw new AppException(ErrorCode.FILE_SIZE_EXCEED);
        } catch (Exception e) {
            // Các lỗi khác (RuntimeException, NullPointerException,...)
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED, "Upload thất bại: " + e.getMessage());
        }
    }


    @Override
    public Map deleteFile(String fileUrl){
        if (fileUrl == null || fileUrl.isEmpty()) {
            // Không có URL thì không cần xóa, trả về kết quả thành công giả
            System.out.println("File URL is empty, skipping Cloudinary deletion.");
            return ObjectUtils.asMap("result", "ok_skipped");
        }

        String publicId = extractPublicIdFromUrl(fileUrl);
        if (publicId == null) {
            // Không thể trích xuất publicId, log lỗi và có thể bỏ qua hoặc ném exception
            System.err.println("Could not extract publicId from URL: " + fileUrl);
            // Có thể ném AppException ở đây nếu muốn việc xóa DB thất bại theo
            // throw new AppException(ErrorCode.INVALID_FILE_URL);
            // Hoặc coi như thành công để record DB vẫn bị xóa
            return ObjectUtils.asMap("result", "error_parsing_id");
        }

        // Xác định resource_type dựa trên URL (cách đơn giản)
        // Cloudinary cần biết loại file (image, video, raw) để xóa
        String resourceType = "auto"; // Thường auto hoạt động tốt cho destroy
        if (fileUrl.contains("/image/upload/")) {
            resourceType = "image";
        } else if (fileUrl.contains("/video/upload/")) {
            resourceType = "video";
        } else if (fileUrl.contains("/raw/upload/")) {
            // PDF, DOCX, etc., thường là "raw" trên Cloudinary nếu không phải ảnh/video
            resourceType = "raw";
        }
        // Lưu ý: "auto" cũng có thể hoạt động cho destroy, nhưng chỉ định rõ ràng sẽ an toàn hơn.


        System.out.println("Attempting to delete from Cloudinary. Public ID: " + publicId + ", Resource Type: " + resourceType);

        Map options = ObjectUtils.asMap("resource_type", resourceType);
        Map deleteResult = null;
        try {
            deleteResult = cloudinary.uploader().destroy(publicId, options);
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_DELETE_FAIL, e.getMessage());
        }

        System.out.println("Cloudinary deletion result: " + deleteResult);

        // Kiểm tra kết quả trả về từ Cloudinary (thường là {"result":"ok"} hoặc {"result":"not found"})
        if (!"ok".equals(deleteResult.get("result")) && !"not found".equals(deleteResult.get("result"))) {
            // Nếu kết quả không phải "ok" hoặc "not found", có thể đã có lỗi
            throw new AppException(ErrorCode.FILE_DELETE_FAIL, deleteResult.toString());
        }

        return deleteResult;
    }



    // --- THÊM HÀM HELPER ĐỂ TRÍCH XUẤT PUBLIC ID ---
    private String extractPublicIdFromUrl(String url) {
        // Ví dụ URL: https://res.cloudinary.com/demo/image/upload/v1617084537/folder/subfolder/sample.jpg
        // Public ID cần lấy: folder/subfolder/sample

        // Regex để tìm phần sau /upload/ (hoặc image/upload, video/upload, raw/upload)
        // và loại bỏ phần version (v<số>/) nếu có, cùng phần đuôi file (.jpg, .pdf)
        Pattern pattern = Pattern.compile("/(?:image|video|raw)/upload/(?:v\\d+/)?(.+?)(?:\\.[^./]+)?$");
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1); // Group 1 chứa publicId (bao gồm cả folder)
        }
        return null; // Không tìm thấy
    }
}
