package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.configuration.AzureProps;
import com.microsoft.cognitiveservices.speech.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TextToSpeechService {
    private final AzureProps props;

    public byte[] synthJa(String text) throws Exception {
        var cfg = SpeechConfig.fromSubscription(props.getSpeech().getKey(), props.getSpeech().getRegion());
        cfg.setSpeechSynthesisVoiceName("ja-JP-NanamiNeural");
        cfg.setSpeechSynthesisOutputFormat(SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm);

        try (SpeechSynthesizer synth = new SpeechSynthesizer(cfg, null)) {
            var res = synth.SpeakTextAsync(text).get();
            if (res.getReason() == ResultReason.SynthesizingAudioCompleted) return res.getAudioData();
            if (res.getReason() == ResultReason.Canceled) {
                var d = SpeechSynthesisCancellationDetails.fromResult(res);
                throw new RuntimeException("TTS canceled: " + d.getErrorDetails());
            }
            throw new RuntimeException("TTS failed");
        }
    }
}

