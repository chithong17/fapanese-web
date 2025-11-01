package com.ktnl.fapanese.service.implementations;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.ai.openai.models.ChatCompletionsOptions;
import com.azure.ai.openai.models.ChatRequestSystemMessage;
import com.azure.ai.openai.models.ChatRequestUserMessage;
import com.azure.core.credential.AzureKeyCredential;
import com.ktnl.fapanese.configuration.AzureProps;
import com.ktnl.fapanese.dto.request.ExplainExamRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class OpenAIService {
    private final AzureProps props;

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
}
