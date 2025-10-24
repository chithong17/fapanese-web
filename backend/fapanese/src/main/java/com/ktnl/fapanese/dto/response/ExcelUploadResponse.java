package com.ktnl.fapanese.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExcelUploadResponse {
    int totalRowsProcessed = 0; // Total data rows attempted
    int successCount = 0;
    int failureCount = 0;
    List<String> errorMessages = new ArrayList<>(); // Detailed errors with row numbers

    // Helper methods can be added if needed
    public void addErrorMessage(int rowNumber, String error) {
        this.errorMessages.add(String.format("Dòng %d: %s", rowNumber, error));
        this.failureCount++;
    }
}
