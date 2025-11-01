package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.configuration.AzureProps;
import com.microsoft.cognitiveservices.speech.*;
import com.microsoft.cognitiveservices.speech.audio.AudioConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class TextToSpeechService {
    private final AzureProps props;

    // Giọng nói Mặc định cho Tiếng Việt
    private static final String VI_VOICE = "vi-VN-HoaiMyNeural";
    // Giọng nói Mặc định cho Tiếng Nhật
    private static final String JA_VOICE = "ja-JP-NanamiNeural";
    // Mẫu regex để tìm kiếm nội dung được bọc: [JA:Nội dung tiếng Nhật:JA]
    private static final Pattern JA_PATTERN = Pattern.compile("\\[JA:(.*?):JA\\]");

    /**
     * Tổng hợp giọng nói đa ngôn ngữ (Tiếng Việt và Tiếng Nhật)
     * @param aiText Phản hồi từ AI, bao gồm cả nội dung Tiếng Việt và các tag [JA:...:JA]
     * @return Dữ liệu âm thanh dạng byte array
     */
    public byte[] synthSsmlPolyglot(String aiText) throws Exception {
        // 1. Chuẩn bị SSML
        String ssmlContent = createPolyglotSsml(aiText);
        log.info("Generated SSML: {}", ssmlContent);

        // 2. Cấu hình Azure TTS
        var cfg = SpeechConfig.fromSubscription(props.getSpeech().getKey(), props.getSpeech().getRegion());
        cfg.setSpeechSynthesisOutputFormat(SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm);

        // 3. Thực hiện tổng hợp giọng nói
        try (SpeechSynthesizer synth = new SpeechSynthesizer(cfg, null)) {
            var res = synth.SpeakSsmlAsync(ssmlContent).get();

            if (res.getReason() == ResultReason.SynthesizingAudioCompleted) return res.getAudioData();

            if (res.getReason() == ResultReason.Canceled) {
                var d = SpeechSynthesisCancellationDetails.fromResult(res);
                log.error("TTS canceled: Error code {} - Details: {}", d.getErrorCode(), d.getErrorDetails());
                // Ném ngoại lệ, giúp GlobalExceptionHandler trả về lỗi
                throw new RuntimeException("TTS canceled: " + d.getErrorDetails());
            }
            throw new RuntimeException("TTS failed with unknown reason: " + res.getReason());
        }
    }

    /**
     * Xây dựng cấu trúc SSML từ văn bản thô.
     * Tự động chuyển đổi phần không có tag sang Tiếng Việt, phần có tag [JA:...:JA] sang Tiếng Nhật.
     */
    private String createPolyglotSsml(String text) {
        StringBuilder ssmlBuilder = new StringBuilder();
        Matcher matcher = JA_PATTERN.matcher(text);
        int lastAppendPosition = 0;

        while (matcher.find()) {
            // Lấy nội dung Tiếng Việt (phần không được bọc)
            String viPart = text.substring(lastAppendPosition, matcher.start());

            // Lấy nội dung Tiếng Nhật (phần bên trong [JA: :JA])
            String jaPart = matcher.group(1);

            // 1. Append phần Tiếng Việt (Voice: vi-VN-HoaiMyNeural)
            if (!viPart.trim().isEmpty()) {
                ssmlBuilder.append(String.format("<voice name='%s'>%s</voice>",
                        VI_VOICE, escapeSsml(viPart)));
            }

            // 2. Append phần Tiếng Nhật (Voice: ja-JP-NanamiNeural)
            ssmlBuilder.append(String.format("<voice name='%s'>%s</voice>",
                    JA_VOICE, escapeSsml(jaPart)));

            lastAppendPosition = matcher.end();
        }

        // Lấy phần còn lại là Tiếng Việt
        String remainingViPart = text.substring(lastAppendPosition);
        if (!remainingViPart.trim().isEmpty()) {
            ssmlBuilder.append(String.format("<voice name='%s'>%s</voice>",
                    VI_VOICE, escapeSsml(remainingViPart)));
        }

        // Bọc toàn bộ trong SSML root tag
        return String.format("<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'>%s</speak>",
                ssmlBuilder.toString());
    }

    /**
     * Escape các ký tự đặc biệt của SSML để tránh lỗi phân tích cú pháp.
     */
    private String escapeSsml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}