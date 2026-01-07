package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.configuration.AzureProps;
import com.microsoft.cognitiveservices.speech.*;
import com.microsoft.cognitiveservices.speech.audio.AudioConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpeechToTextService {
    private final AzureProps props;

    public String transcribeWav(byte[] inputBytes) throws Exception {
        // 1️⃣ Ghi file tạm WebM (hoặc file gốc, ví dụ: "audio.webm")
        Path tempInput = Files.createTempFile("audio-", ".webm");
        Files.write(tempInput, inputBytes);

        // 2️⃣ Convert WebM -> WAV
        Path tempWav = Files.createTempFile("converted-", ".wav");

        // Tự động xác định OS
        String os = System.getProperty("os.name").toLowerCase();
        String ffmpegPath;
        if (os.contains("win")) {
            // Windows path (Chocolatey)
            ffmpegPath = "C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe";
        } else {
            // Linux/Mac: ffmpeg đã có trong PATH
            ffmpegPath = "ffmpeg";
        }

        // Chạy FFmpeg convert
        Process process = new ProcessBuilder(
                ffmpegPath, "-y",
                "-i", tempInput.toString(),
                "-ar", "16000", // 16kHz
                "-ac", "1",     // Mono
                "-f", "wav",
                tempWav.toString()
        ).redirectErrorStream(true).start();
        process.waitFor();

        long wavSize = Files.exists(tempWav) ? Files.size(tempWav) : 0;
        log.info("✅ FFmpeg convert done. File size: {} bytes", wavSize);

        if (wavSize == 0) {
            Files.deleteIfExists(tempInput);
            throw new RuntimeException("⚠️ FFmpeg failed to convert file");
        }

        // 3️⃣ Nhận diện giọng nói qua Azure
        SpeechConfig cfg = SpeechConfig.fromSubscription(
                props.getSpeech().getKey(),
                props.getSpeech().getRegion()
        );
        cfg.setSpeechRecognitionLanguage("ja-JP");

        StringBuilder fullTranscript = new StringBuilder();
        CompletableFuture<Void> fileProcessingDone = new CompletableFuture<>();

        try (AudioConfig audio = AudioConfig.fromWavFileInput(tempWav.toString());
             SpeechRecognizer recognizer = new SpeechRecognizer(cfg, audio)) {

            // Nhận diện mỗi cụm từ
            recognizer.recognized.addEventListener((s, e) -> {
                if (e.getResult().getReason() == ResultReason.RecognizedSpeech) {
                    log.debug("Recognized: {}", e.getResult().getText());
                    fullTranscript.append(e.getResult().getText()).append(" ");
                }
            });

            // Khi hết file
            recognizer.sessionStopped.addEventListener((s, e) -> {
                log.info("✅ End of audio file reached. Session stopped.");
                fileProcessingDone.complete(null);
            });

            // Khi có lỗi
            recognizer.canceled.addEventListener((s, e) -> {
                log.error("STT Canceled: Reason={}", e.getReason());
                if (e.getReason() == CancellationReason.Error) {
                    log.error("STT Error Details: {}", e.getErrorDetails());
                    fileProcessingDone.completeExceptionally(
                            new RuntimeException("STT Error: " + e.getErrorDetails())
                    );
                } else {
                    fileProcessingDone.complete(null);
                }
            });

            // Bắt đầu nhận diện liên tục
            recognizer.startContinuousRecognitionAsync().get();

            // Chờ cho đến khi sessionStopped
            fileProcessingDone.get();

            // Dừng recognizer
            recognizer.stopContinuousRecognitionAsync().get();

            // Trả về transcript
            String result = fullTranscript.toString().trim();
            if (result.isEmpty()) {
                throw new RuntimeException("No speech recognized (empty transcript)");
            }
            return result;

        } finally {
            // Dọn dẹp file tạm
            Files.deleteIfExists(tempInput);
            Files.deleteIfExists(tempWav);
        }
    }
}

