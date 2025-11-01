package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.ExplainExamRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.service.implementations.OpenAIService;
import com.ktnl.fapanese.service.implementations.SpeechToTextService;
import com.ktnl.fapanese.service.implementations.TextToSpeechService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(origins = {"http://localhost:5173"}) // chỉnh theo FE
@RequiredArgsConstructor
public class InterviewController {
    private final SpeechToTextService stt;
    private final OpenAIService openai;
    private final TextToSpeechService tts;

    // Giọng nói mặc định cho Tiếng Việt và Tiếng Nhật
    private static final String VIET_VOICE = "vi-VN-NamMinhNeural"; // Giọng Nam Việt
    private static final String JAPANESE_VOICE = "ja-JP-KeitaNeural";
    // Regex để tìm kiếm các đoạn Tiếng Nhật được bọc bởi [JA:...:JA]
    // Tùy chỉnh Prosody cho Tiếng Việt: Giọng Nam, Tăng 10% tốc độ
    private static final String VIET_PROSODY = "rate=\"+10%\" pitch=\"medium\"";
    private static final Pattern JAPANESE_PATTERN = Pattern.compile("\\[JA:(.*?):JA\\]");

    /**
     * Hàm tiện ích để thoát các ký tự đặc biệt XML/SSML.
     * Giải quyết lỗi "An error occurred while parsing EntityName".
     */
    private String escapeXml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    /**
     * Hàm tiện ích để tạo SSML (Đã tích hợp Prosody để đồng bộ giọng đọc).
     */
    private String buildSSMLFromReviewText(String reviewText) {
        if (reviewText == null || reviewText.isEmpty()) {
            return "<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"vi-VN\"></speak>";
        }

        StringBuilder ssmlBuilder = new StringBuilder();

        // Bắt đầu SSML, áp dụng Prosody cho Tiếng Việt
        ssmlBuilder.append("<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"vi-VN\">")
                .append("<voice name=\"").append(VIET_VOICE).append("\">")
                .append("<prosody rate=\"medium\" pitch=\"medium\">"); // ÁP DỤNG PROSODY CHO TIẾNG VIỆT

        // Sử dụng Regex để tìm và thay thế các đoạn Tiếng Nhật
        Matcher matcher = JAPANESE_PATTERN.matcher(reviewText);
        int lastEnd = 0;

        while (matcher.find()) {
            // 1. Lấy phần Tiếng Việt trước đoạn Tiếng Nhật
            String vietSegment = reviewText.substring(lastEnd, matcher.start());
            ssmlBuilder.append(escapeXml(vietSegment));

            // 2. Chuyển sang giọng Tiếng Nhật
            String japaneseText = matcher.group(1);
            ssmlBuilder.append("</prosody>") // Đóng Prosody của Tiếng Việt
                    .append("</voice>")
                    .append("<voice name=\"").append(JAPANESE_VOICE).append("\" xml:lang=\"ja-JP\">")
                    .append("<prosody rate=\"medium\" pitch=\"medium\">") // ÁP DỤNG PROSODY CHO TIẾNG NHẬT
                    .append(escapeXml(japaneseText))
                    .append("</prosody>") // Đóng Prosody của Tiếng Nhật
                    .append("</voice>")
                    .append("<voice name=\"").append(VIET_VOICE).append("\">")
                    .append("<prosody rate=\"medium\" pitch=\"medium\">"); // Mở lại Prosody cho Tiếng Việt

            lastEnd = matcher.end();
        }

        // 3. Lấy phần Tiếng Việt còn lại (nếu có)
        ssmlBuilder.append(escapeXml(reviewText.substring(lastEnd)));

        // 4. Đóng thẻ
        ssmlBuilder.append("</prosody>") // Đóng Prosody cuối cùng
                .append("</voice>")
                .append("</speak>");

        return ssmlBuilder.toString();
    }

    // --- Các API Endpoint ---

    @PostMapping(value="/stt", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String,Object> stt(@RequestPart("audio") MultipartFile audio) throws Exception {
        var text = stt.transcribeWav(audio.getBytes());
        return Map.of("text", text);
    }

    @PostMapping("/chat")
    public Map<String,Object> chat(@RequestBody Map<String,String> body) {
        var userText = body.getOrDefault("text", "");
        var aiText = openai.chatInterview(userText);
        return Map.of("userText", userText, "aiText", aiText);
    }

    /**
     * Endpoint TTS đã được cập nhật để sử dụng SSML và khắc phục lỗi.
     * Đã giả định hàm TTS trong Service là 'synthSsml'.
     */
    @PostMapping(value="/tts", produces = "audio/wav")
    public ResponseEntity<byte[]> tts(@RequestBody Map<String,String> body) throws Exception {
        var reviewText = body.getOrDefault("text","");

        // 1. Chuyển văn bản nhận xét thô thành chuỗi SSML đa ngôn ngữ
        String ssmlText = buildSSMLFromReviewText(reviewText);

        // 2. Gọi hàm TTS mới
        var audio = tts.synthSsml(ssmlText);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=reply.wav")
                .contentType(MediaType.valueOf("audio/wav"))
                .body(audio);
    }


    /**
     * Endpoint tương tác đã được cập nhật để sử dụng SSML và khắc phục lỗi.
     * Đã giả định hàm TTS trong Service là 'synthSsml'.
     */
    @PostMapping(value = "/interact", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> interact(@RequestPart("audio") MultipartFile audio) throws Exception {
        // 1️⃣ Speech to Text
        String userText = stt.transcribeWav(audio.getBytes());

        // 2️⃣ Gọi OpenAI để nhận xét tiếng Việt (+ Nhật)
        String aiText = openai.chatInterview(userText);

        // 3️⃣ Chuyển phản hồi thành chuỗi SSML đa ngôn ngữ
        String ssmlText = buildSSMLFromReviewText(aiText);

        // 4️⃣ Chuyển SSML thành âm thanh đa ngôn ngữ
        byte[] aiAudio = tts.synthSsml(ssmlText);

        // 5️⃣ Trả về JSON (text + audio base64)
        Map<String, Object> result = new HashMap<>();
        result.put("userText", userText);
        result.put("aiText", aiText);
        result.put("audioBase64", Base64.getEncoder().encodeToString(aiAudio));

        return ResponseEntity.ok(result);
    }

    @PostMapping("/explain-exam")
    public ApiResponse<String> explainExam(@RequestBody ExplainExamRequest explainExamRequest){
        String aiResponse = openai.explainExam(explainExamRequest);
        return ApiResponse.<String>builder()
                .result(aiResponse)
                .build();
    }
}