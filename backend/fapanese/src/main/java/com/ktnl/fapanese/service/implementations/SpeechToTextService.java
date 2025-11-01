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

        // 2️⃣ Convert WebM -> WAV (Giữ nguyên logic FFmpeg của bạn)
        String ffmpegPath = "C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe"; // Hoặc đường dẫn động
        Path tempWav = Files.createTempFile("converted-", ".wav");

        Process process = new ProcessBuilder(
                ffmpegPath, "-y",
                "-i", tempInput.toString(),
                "-ar", "16000", // Tần số 16kHz
                "-ac", "1", // 1 kênh (mono)
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

        // 3️⃣ Nhận diện giọng nói qua Azure (ĐÃ THAY ĐỔI)
        SpeechConfig cfg = SpeechConfig.fromSubscription(
                props.getSpeech().getKey(),
                props.getSpeech().getRegion()
        );
        cfg.setSpeechRecognitionLanguage("ja-JP");

        // Dùng để lưu trữ toàn bộ văn bản được ghép lại
        StringBuilder fullTranscript = new StringBuilder();

        // Dùng để báo hiệu khi file đã được xử lý XONG
        CompletableFuture<Void> fileProcessingDone = new CompletableFuture<>();

        try (AudioConfig audio = AudioConfig.fromWavFileInput(tempWav.toString());
             SpeechRecognizer recognizer = new SpeechRecognizer(cfg, audio)) {

            // SỰ KIỆN 1: Kích hoạt mỗi khi nhận diện được 1 cụm từ
            recognizer.recognized.addEventListener((s, e) -> {
                if (e.getResult().getReason() == ResultReason.RecognizedSpeech) {
                    log.debug("Recognized: {}", e.getResult().getText());
                    // Ghép cụm từ vào kết quả cuối cùng
                    fullTranscript.append(e.getResult().getText()).append(" ");
                }
                // (Chúng ta bỏ qua NoMatch vì file vẫn đang chạy)
            });

            // SỰ KIỆN 2: Kích hoạt khi hết file (session dừng lại)
            recognizer.sessionStopped.addEventListener((s, e) -> {
                log.info("✅ End of audio file reached. Session stopped.");
                fileProcessingDone.complete(null); // Báo hiệu: Đã xong
            });

            // SỰ KIỆN 3: Kích hoạt nếu có lỗi
            recognizer.canceled.addEventListener((s, e) -> {
                log.error("STT Canceled: Reason={}", e.getReason());
                if (e.getReason() == CancellationReason.Error) {
                    log.error("STT Error Details: {}", e.getErrorDetails());
                    fileProcessingDone.completeExceptionally(
                            new RuntimeException("STT Error: " + e.getErrorDetails())
                    );
                } else {
                    fileProcessingDone.complete(null); // Vẫn hoàn thành nếu chỉ là cancel
                }
            });

            // 4. BẮT ĐẦU nhận diện LIÊN TỤC
            recognizer.startContinuousRecognitionAsync().get();

            // 5. CHỜ cho đến khi sự kiện sessionStopped được kích hoạt
            fileProcessingDone.get(); // Chặn luồng (block) cho đến khi fileProcessingDone.complete() được gọi

            // 6. Dừng recognizer (dọn dẹp)
            recognizer.stopContinuousRecognitionAsync().get();

            // 7. Trả về kết quả đã ghép
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

