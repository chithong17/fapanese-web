package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.configuration.AzureProps;
import com.microsoft.cognitiveservices.speech.CancellationDetails;
import com.microsoft.cognitiveservices.speech.SpeechConfig;
import com.microsoft.cognitiveservices.speech.SpeechRecognizer;
import com.microsoft.cognitiveservices.speech.audio.AudioConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;

@Service
@RequiredArgsConstructor
public class SpeechToTextService {
    private final AzureProps props;

    public String transcribeWav(byte[] inputBytes) throws Exception {
        // 1️⃣ Ghi file tạm WebM
        Path tempWebm = Files.createTempFile("audio-", ".webm");
        Files.write(tempWebm, inputBytes);

        // 2️⃣ Convert WebM -> WAV
        String ffmpegPath = "C:\\Users\\ACER\\Downloads\\ffmpeg-2025-07-17-git-bc8d06d541-full_build\\ffmpeg-2025-07-17-git-bc8d06d541-full_build\\bin\\ffmpeg.exe";
        Path tempWav = Files.createTempFile("converted-", ".wav");

        Process process = new ProcessBuilder(
                ffmpegPath, "-y",
                "-i", tempWebm.toString(),
                "-ar", "16000",
                "-ac", "1",
                "-f", "wav",
                tempWav.toString()
        ).redirectErrorStream(true).start();
        process.waitFor();

        long wavSize = Files.exists(tempWav) ? Files.size(tempWav) : 0;
        System.out.println("✅ FFmpeg convert done. File size: " + wavSize + " bytes");

        if (wavSize == 0) throw new RuntimeException("⚠️ FFmpeg failed to convert WebM → WAV");

        // 3️⃣ Nhận diện giọng nói qua Azure
        SpeechConfig cfg = SpeechConfig.fromSubscription(
                props.getSpeech().getKey(),
                props.getSpeech().getRegion()
        );
        cfg.setSpeechRecognitionLanguage("ja-JP");

        try (AudioConfig audio = AudioConfig.fromWavFileInput(tempWav.toString());
             SpeechRecognizer recognizer = new SpeechRecognizer(cfg, audio)) {

            var res = recognizer.recognizeOnceAsync().get();
            return switch (res.getReason()) {
                case RecognizedSpeech -> res.getText();
                case NoMatch -> throw new RuntimeException("No speech recognized");
                case Canceled -> throw new RuntimeException(
                        "STT canceled: " + CancellationDetails.fromResult(res).getErrorDetails());
                default -> throw new RuntimeException("Unknown STT result");
            };
        } finally {
            Files.deleteIfExists(tempWebm);
            Files.deleteIfExists(tempWav);
        }
    }
}

