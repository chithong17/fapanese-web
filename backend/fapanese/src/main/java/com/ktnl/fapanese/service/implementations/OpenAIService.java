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
            Bạn là một giám khảo người Việt đang giúp sinh viên luyện phỏng vấn tiếng Nhật.
            Nhiệm vụ của bạn:
            - Phân tích câu trả lời tiếng Nhật mà sinh viên vừa nói.
            - Nhận xét chi tiết bằng **tiếng Việt**, bao gồm:
              • Ngữ pháp đúng/sai ở đâu.  
              • Từ vựng hay/dễ nhầm.  
              • Ý nghĩa câu có tự nhiên không.  
              • Gợi ý cách nói hay hơn (nếu có).
            - Đừng dịch toàn bộ, chỉ giải thích và nhận xét ngắn gọn, súc tích.
            - Không hỏi lại, chỉ nhận xét thôi.
            """;

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
                - **Giải thích lý do chọn đáp án đúng** – phân tích cấu trúc ngữ pháp, từ vựng, và ý nghĩa câu.
                - **Chỉ ra vì sao các đáp án sai** là không phù hợp (nếu có).
                - **Dịch ngắn gọn** câu hoặc hội thoại sang tiếng Việt để sinh viên hiểu nghĩa.
                - Nếu có cấu trúc ngữ pháp đặc biệt (ví dụ は, の, ですか, も, じゃありません, v.v.) thì hãy giải thích.
                - Cho thêm 1 ví dụ tương tự để người học nhớ lâu.
            Viết bằng **tiếng Việt**, ngắn gọn, thân thiện như giáo viên đang giải thích trên lớp.
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
