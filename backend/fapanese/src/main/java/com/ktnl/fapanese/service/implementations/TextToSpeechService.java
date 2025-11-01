package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.configuration.AzureProps;
import com.microsoft.cognitiveservices.speech.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TextToSpeechService {
    private final AzureProps props;

    // Đổi tên hàm thành synthSsml để phản ánh đúng chức năng
    public byte[] synthSsml(String ssmlText) throws Exception {
        var cfg = SpeechConfig.fromSubscription(props.getSpeech().getKey(), props.getSpeech().getRegion());

        // KHÔNG CẦN CẤU HÌNH VOICE NAME Ở ĐÂY. SSML sẽ lo việc đó.
        cfg.setSpeechSynthesisOutputFormat(SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm);

        try (SpeechSynthesizer synth = new SpeechSynthesizer(cfg, null)) {
            // *** BƯỚC QUAN TRỌNG NHẤT: Dùng SpeakSsmlAsync ***
            var res = synth.SpeakSsmlAsync(ssmlText).get();

            if (res.getReason() == ResultReason.SynthesizingAudioCompleted) return res.getAudioData();
            if (res.getReason() == ResultReason.Canceled) {
                var d = SpeechSynthesisCancellationDetails.fromResult(res);
                throw new RuntimeException("TTS canceled: " + d.getErrorDetails());
            }
            throw new RuntimeException("TTS failed");
        }
    }
}

