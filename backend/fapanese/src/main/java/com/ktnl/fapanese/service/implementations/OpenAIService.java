package com.ktnl.fapanese.service.implementations;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.ai.openai.models.*;
import com.azure.core.credential.AzureKeyCredential;
import com.azure.core.util.BinaryData;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ktnl.fapanese.configuration.AzureProps;
import com.ktnl.fapanese.dto.request.ExplainExamRequest;
import com.ktnl.fapanese.dto.request.GradingSpeakingTestRequest;
import com.ktnl.fapanese.dto.response.GradingSpeakingTestResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAIService {
    private final AzureProps props;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private OpenAIClient client() {
        return new OpenAIClientBuilder()
                .endpoint(props.getOpenai().getEndpoint())
                .credential(new AzureKeyCredential(props.getOpenai().getKey()))
                .buildClient();
    }

    public String chatInterview(String userJa) {
        var system = """
[GIA SƯ GIAO TIẾP TỰ NHIÊN CÓ CẤU TRÚC - TỐI ƯU TTS]

**VAI TRÒ:** Gia sư ngôn ngữ Tiếng Nhật, tập trung vào **luyện tập giao tiếp tự nhiên (日常会話), ngữ pháp cơ bản, và cách diễn đạt thông thường**. Mục tiêu là giúp người dùng nói trôi chảy và tự nhiên như người bản xứ trong các tình huống hàng ngày.

**NGÔN NGỮ PHẢN HỒI:** 100% TIẾNG VIỆT.

**CẤU TRÚC PHẢN HỒI (BẮT BUỘC):** Phản hồi phải được chia thành **ĐÚNG 3 MỤC** như sau:
1. Đánh giá & Tổng quan: (Nhận xét nhanh về độ tự nhiên và dễ hiểu.)
2. Phân tích Chuyên sâu: (Chỉ ra lỗi Ngữ pháp/Từ vựng nếu có, và đánh giá Văn phong Tự nhiên/Casual. KHÔNG tập trung vào Kính ngữ.)
3. Gợi ý Nâng cấp & Hội thoại tiếp theo: (Đề xuất cách diễn đạt tự nhiên hơn VÀ đặt MỘT CÂU HỎI TIẾP THEO để duy trì cuộc trò chuyện.)

**QUY TẮC ĐỊNH DẠNG TTS (BẮT BUỘT):**
BỌC TẤT CẢ CÁC TỪ, CỤM TỪ, HOẶC CÂU NÓI BẰNG TIẾNG NHẬT (KỂ CẢ VÍ DỤ VÀ GỢI Ý) BẰNG KÝ HIỆU: [JA:...:JA].

**NHIỆM VỤ:** Áp dụng cấu trúc 3 mục BẮT BUỘC để phân tích input của người dùng và tạo ra câu hỏi tiếp theo.
""";

// Ví dụ về cách phản hồi của AI LLM tuân thủ cấu trúc 3 mục:
/*
**1. Đánh giá & Tổng quan:**
Câu trả lời rất rõ ràng và chuẩn mực ([JA:〜を勉強しています:JA]). Phù hợp để trả lời câu hỏi về ngành học trong giao tiếp thông thường.

**2. Phân tích Chuyên sâu:**
* **Ngữ pháp & Từ vựng:**
Câu [JA:ITを勉強しています:JA] hoàn toàn đúng ngữ pháp. Không có lỗi sai nào.
* **Độ Tự nhiên & Văn phong:**
Cách diễn đạt hiện tại rất tốt. Nếu muốn nhấn mạnh hơn về sự nhiệt tình hoặc đam mê, bạn có thể thêm các từ phụ.

**3. Gợi ý Nâng cấp & Hội thoại tiếp theo:**
Để câu trả lời có thêm thông tin và tự nhiên hơn, bạn có thể thêm một câu phụ về lý do chọn ngành hoặc lĩnh vực cụ thể, ví dụ: [JA:ITを勉強しています。特にプログラミングに興味があります。:JA] (Tôi học IT. Đặc biệt hứng thú với lập trình.)
Bây giờ, hãy tiếp tục. Bạn có thường dùng Tiếng Nhật trong cuộc sống hàng ngày không? [JA:普段、日本語をよく使いますか？:JA]
*/

        var messages = Arrays.asList(
                new ChatRequestSystemMessage(system),
                new ChatRequestUserMessage("Câu sinh viên nói: " + userJa)
        );

        var options = new ChatCompletionsOptions(messages).setTemperature(0.6);

        var resp = client().getChatCompletions(props.getOpenai().getDeploymentName(), options);
        return resp.getChoices().get(0).getMessage().getContent();
    }

    public String explainExam(ExplainExamRequest explainExamRequest) {
        var system = """
            Bạn là một giảng viên tiếng Nhật người Việt, đang hỗ trợ sinh viên luyện đề thi môn tiếng nhật.
            Nhiệm vụ của bạn:
                - Giải thích lý do chọn đáp án đúng – phân tích cấu trúc ngữ pháp, từ vựng, và ý nghĩa câu.
                - Chỉ ra vì sao các đáp án sai là không phù hợp (nếu có).
                - Dịch ngắn gọn câu hoặc hội thoại sang tiếng Việt để sinh viên hiểu nghĩa.
                - Nếu có cấu trúc ngữ pháp đặc biệt (ví dụ は, の, ですか, も, じゃありません, v.v.) thì hãy giải thích.
                - Cho thêm 1 ví dụ tương tự để người học nhớ lâu.
            Viết bằng tiếng Việt, ngắn gọn, thân thiện như giáo viên đang giải thích trên lớp.
            """;

        var userPrompt = String.format("""
        Câu hỏi: %s
        Đáp án:
        %s
        Đáp án đúng: %s
        """, explainExamRequest.getQuestion(),
                explainExamRequest.getOptions(),
                explainExamRequest.getCorrectAnswer());

        var messages = Arrays.asList(
                new ChatRequestSystemMessage(system),
                new ChatRequestUserMessage(userPrompt)
        );

        var opts  = new ChatCompletionsOptions(messages).setTemperature(0.6);

        var resp = client().getChatCompletions(props.getOpenai().getDeploymentName(), opts);
        return resp.getChoices().get(0).getMessage().getContent();
    }

    public GradingSpeakingTestResponse gradeSpeakingTest(GradingSpeakingTestRequest request) throws JsonProcessingException {
        // 1. Định nghĩa System Prompt (Vai trò của AI)
        var systemPrompt = """
            Bạn là một giảng viên tiếng Nhật dày dạn kinh nghiệm, chuyên chấm thi vấn đáp.
            Nhiệm vụ của bạn là đưa ra nhận xét chi tiết, công bằng và mang tính xây dựng cho bài thi của sinh viên.
            Bạn phải đánh giá dựa trên:
            1.  **Phát âm (Pronunciation)**: So sánh bài đọc (transcript) với văn bản gốc.
            2.  **Độ trôi chảy (Fluency)**.
            3.  **Độ chính xác (Accuracy)**: Nghe hiểu câu hỏi và trả lời đúng/chính xác so với đáp án mẫu.
            4.  **Ngữ pháp (Grammar)**: Dùng đúng cấu trúc ngữ pháp hay không.
            
            Hãy nhận xét ngắn gọn, tập trung vào điểm mạnh và điểm yếu.
            PHẢI trả về kết quả dưới dạng một đối tượng JSON.
            """;

        // 2. Định nghĩa User Prompt (Dữ liệu bài làm)
        var userPrompt = String.format("""
            Dưới đây là bài làm của sinh viên. Hãy chấm điểm:

            --- PHẦN 1: ĐỌC ĐOẠN VĂN (PASSAGE) ---
            [Đề bài (Gốc)]: %s
            [Bài làm (Transcript)]: %s
            
            --- PHẦN 2: TRANH (PICTURE) ---
            [Câu hỏi]: %s
            [Đáp án mẫu]: %s
            [Bài làm (Transcript)]: %s
            
            --- PHẦN 3: CÂU HỎI TỰ DO ---
            [Câu 1 - Câu hỏi]: %s
            [Câu 1 - Đáp án mẫu]: %s
            [Câu 1 - Bài làm (Transcript)]: %s
            
            [Câu 2 - Câu hỏi]: %s
            [Câu 2 - Đáp án mẫu]: %s
            [Câu 2 - Bài làm (Transcript)]: %s
            
            --- YÊU CẦU ---
            Dựa vào dữ liệu trên, hãy cung cấp nhận xét cho 4 phần (passage, picture, question1, question2)
            và một nhận xét tổng kết (overall).
            """,
                escapeJson(request.getPassageOriginal()),
                escapeJson(request.getPassageTranscript()),
                escapeJson(request.getPictureQuestion()),
                escapeJson(request.getPictureAnswerSample()),
                escapeJson(request.getPictureAnswerTranscript()),
                escapeJson(request.getQ1Question()),
                escapeJson(request.getQ1AnswerSample()),
                escapeJson(request.getQ1AnswerTranscript()),
                escapeJson(request.getQ2Question()),
                escapeJson(request.getQ2AnswerSample()),
                escapeJson(request.getQ2AnswerTranscript())
        );

        List<ChatRequestMessage> messages = Arrays.asList(
                new ChatRequestSystemMessage(systemPrompt),
                new ChatRequestUserMessage(userPrompt)
        );

        // 3. Định nghĩa Schema JSON (Rất quan trọng)
        // Yêu cầu AI trả về JSON khớp với cấu trúc GradingResponse
        String jsonSchema = """
            {
              "type": "object",
              "properties": {
                "passage": { "type": "string", "description": "Nhận xét chi tiết về phần đọc đoạn văn. So sánh bài đọc (transcript) với bản gốc." },
                "picture": { "type": "string", "description": "Nhận xét về phần trả lời câu hỏi tranh. Đánh giá độ chính xác so với đáp án mẫu." },
                "question1": { "type": "string", "description": "Nhận xét về phần trả lời câu hỏi tự do 1." },
                "question2": { "type": "string", "description": "Nhận xét về phần trả lời câu hỏi tự do 2." },
                "overall": { "type": "string", "description": "Một đoạn nhận xét tổng kết toàn bộ bài làm, chỉ ra điểm mạnh, điểm yếu chung." }
              },
              "required": ["passage", "picture", "question1", "question2", "overall"],
              "additionalProperties": false
            }
            """;

        var schema = new ChatCompletionsJsonSchemaResponseFormatJsonSchema("grading_response")
                .setDescription("Schema for grading response")
                .setSchema(BinaryData.fromString(jsonSchema)) // ⚡ convert String → BinaryData
                .setStrict(true);

        // 4. Thiết lập Options, BẮT BUỘC trả về JSON
        var opts = new ChatCompletionsOptions(messages)
                .setTemperature(0.5)
                .setResponseFormat(new ChatCompletionsJsonSchemaResponseFormat(schema));

        // 5. Gọi API
        log.info("Calling Azure OpenAI for grading...");
        ChatCompletions resp = client().getChatCompletions(props.getOpenai().getDeploymentName(), opts);

        String jsonResponse = resp.getChoices().get(0).getMessage().getContent();
        log.info("Received JSON response from AI: {}", jsonResponse);

        // 6. Parse JSON string sang GradingResponse DTO
        return objectMapper.readValue(jsonResponse, GradingSpeakingTestResponse.class);
    }


    private String escapeJson(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("\\", "\\\\") // Phải escape dấu \ trước
                .replace("\"", "\\\"") // Escape dấu "
                .replace("\n", "\\n")  // Escape dòng mới
                .replace("\r", "\\r")  // Escape carriage return
                .replace("\t", "\\t"); // Escape tab
    }
}
