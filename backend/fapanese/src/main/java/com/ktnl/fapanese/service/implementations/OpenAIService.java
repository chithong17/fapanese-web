package com.ktnl.fapanese.service.implementations;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.ai.openai.models.ChatCompletionsOptions;
import com.azure.ai.openai.models.ChatRequestSystemMessage;
import com.azure.ai.openai.models.ChatRequestUserMessage;
import com.azure.core.credential.AzureKeyCredential;
import com.ktnl.fapanese.configuration.AzureProps;
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
}
