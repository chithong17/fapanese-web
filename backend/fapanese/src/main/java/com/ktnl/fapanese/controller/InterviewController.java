package com.ktnl.fapanese.controller;

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

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(origins = {"http://localhost:5173"}) // chỉnh theo FE
@RequiredArgsConstructor
public class InterviewController {
    private final SpeechToTextService stt;
    private final OpenAIService openai;
    private final TextToSpeechService tts;

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

    @PostMapping(value="/tts", produces = "audio/wav")
    public ResponseEntity<byte[]> tts(@RequestBody Map<String,String> body) throws Exception {
        var audio = tts.synthJa(body.getOrDefault("text",""));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=reply.wav")
                .contentType(MediaType.valueOf("audio/wav"))
                .body(audio);
    }


    @PostMapping(value = "/interact", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> interact(@RequestPart("audio") MultipartFile audio) throws Exception {
        // 1️⃣ Speech to Text
        String userText = stt.transcribeWav(audio.getBytes());

        // 2️⃣ Gọi OpenAI để nhận xét tiếng Việt
        String aiText = openai.chatInterview(userText);

        // 3️⃣ Chuyển phản hồi thành âm thanh tiếng Việt
        byte[] aiAudio = tts.synthJa(aiText); // ⚠️ nếu muốn giọng Việt, đổi voice sang vi-VN-HoaiMyNeural trong TextToSpeechService

        // 4️⃣ Trả về JSON (text + audio base64)
        Map<String, Object> result = new HashMap<>();
        result.put("userText", userText);
        result.put("aiText", aiText);
        result.put("audioBase64", Base64.getEncoder().encodeToString(aiAudio));

        return ResponseEntity.ok(result);
    }

}
