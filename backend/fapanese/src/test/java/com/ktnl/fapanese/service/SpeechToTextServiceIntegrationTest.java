package com.ktnl.fapanese.service;

import com.ktnl.fapanese.configuration.AzureProps;
import com.ktnl.fapanese.service.implementations.SpeechToTextService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.util.FileCopyUtils;
import com.ktnl.fapanese.configuration.AzureProps;
import org.springframework.boot.test.mock.mockito.MockBean;
import static org.mockito.Mockito.when;
import org.springframework.core.env.Environment;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest // Tải context đầy đủ, đọc application.properties
class SpeechToTextServiceIntegrationTest {

    @Autowired
    private SpeechToTextService speechToTextService;

    @Autowired
    private Environment env; // Dùng để đọc key thật từ application.properties

    @MockBean // Mock bean này để kiểm soát thông tin Azure
    private AzureProps azureProps;

    @Test
    @DisplayName("Should Transcribe WebM to Text Successfully")
    void transcribeWav_Success() throws Exception {
        // --- ARRANGE ---
        // Cấu hình MockBean cho kịch bản THÀNH CÔNG (dùng key thật)
        AzureProps.Speech speechProps = new AzureProps.Speech();
        speechProps.setKey(env.getProperty("azure.speech.key"));
        speechProps.setRegion(env.getProperty("azure.speech.region"));
        when(azureProps.getSpeech()).thenReturn(speechProps);

        // Tải file "test_audio.webm"
        ClassPathResource resource = new ClassPathResource("test_audio.webm");
        assertTrue(resource.exists(), "File test_audio.webm không tồn tại trong resources");

        byte[] inputBytes = FileCopyUtils.copyToByteArray(resource.getInputStream());
        assertTrue(inputBytes.length > 0, "File test audio bị rỗng");

        // --- ACT ---
        String result = null;
        try {
            result = speechToTextService.transcribeWav(inputBytes);
        } catch (Exception e) {
            fail("Test thất bại do exception: " + e.getMessage(), e);
        }

        // --- ASSERT ---
        assertNotNull(result);
        assertFalse(result.isEmpty(), "Kết quả transcript bị rỗng");
        System.out.println("Kết quả nhận diện: " + result);
    }

    @Test
    @DisplayName("Should Fail if FFmpeg Fails (e.g., bad input)")
    void transcribeWav_FailsOnBadData() {
        // --- ARRANGE ---
        // Test này không gọi Azure nên không cần cấu hình mock
        byte[] badBytes = new byte[] { 1, 2, 3, 4, 5 };

        // --- ACT & ASSERT ---
        Exception exception = assertThrows(RuntimeException.class, () -> {
            speechToTextService.transcribeWav(badBytes);
        });

        String message = exception.getMessage();
        System.out.println("Lỗi mong đợi (FFmpeg fail): " + message);

        // FFmpeg sẽ thất bại và ném lỗi trước khi gọi Azure
        assertTrue(
                message.contains("FFmpeg failed to convert file"),
                "Exception message không như mong đợi: " + message
        );
    }

    @Test
    @DisplayName("Should Fail with 'No speech recognized' for silent audio")
    void transcribeWav_FailsWithSilence() throws Exception {
        // --- ARRANGE ---
        // Phải cấu hình MockBean, vì test này CÓ kết nối Azure
        AzureProps.Speech speechProps = new AzureProps.Speech();
        speechProps.setKey(env.getProperty("azure.speech.key"));
        speechProps.setRegion(env.getProperty("azure.speech.region"));
        when(azureProps.getSpeech()).thenReturn(speechProps);

        // Tải file "silent_audio.webm"
        ClassPathResource resource = new ClassPathResource("silent_audio.webm");
        assertTrue(resource.exists(), "File silent_audio.webm không tồn tại trong resources");

        byte[] inputBytes = FileCopyUtils.copyToByteArray(resource.getInputStream());

        // --- ACT & ASSERT ---
        Exception exception = assertThrows(RuntimeException.class, () -> {
            speechToTextService.transcribeWav(inputBytes);
        });

        String message = exception.getMessage();
        System.out.println("Lỗi mong đợi (im lặng): " + message);
        assertEquals("No speech recognized (empty transcript)", message);
    }

    @Test
    @DisplayName("Should Fail with 'No speech recognized' for non-Japanese audio (NoMatch)")
    void transcribeWav_FailsWithNoMatch() throws Exception {
        // --- ARRANGE ---
        // Cấu hình MockBean cho kịch bản THÀNH CÔNG (để nó kết nối Azure)
        AzureProps.Speech speechProps = new AzureProps.Speech();
        speechProps.setKey(env.getProperty("azure.speech.key"));
        speechProps.setRegion(env.getProperty("azure.speech.region"));
        when(azureProps.getSpeech()).thenReturn(speechProps);

        // Tải file "unrecognized_audio.webm" (file tiếng Anh)
        ClassPathResource resource = new ClassPathResource("unrecognized_audio.webm");
        assertTrue(resource.exists(), "File unrecognized_audio.webm không tồn tại");

        byte[] inputBytes = FileCopyUtils.copyToByteArray(resource.getInputStream());

        // --- ACT & ASSERT ---
        // Mong đợi lỗi, vì transcript cuối cùng sẽ rỗng
        Exception exception = assertThrows(RuntimeException.class, () -> {
            speechToTextService.transcribeWav(inputBytes);
        });

        // JaCoCo sẽ ghi nhận rằng nhánh 'else' (NoMatch) đã được chạy
        // trước khi lỗi này được ném ra
        String message = exception.getMessage();
        System.out.println("Lỗi mong đợi (NoMatch): " + message);
        assertEquals("No speech recognized (empty transcript)", message);
    }

    @Test
    @DisplayName("Should Fail with 'STT Error' for bad credentials")
    void transcribeWav_FailsWithBadCredentials() throws Exception {
        // --- ARRANGE ---
        // Tải file audio bình thường
        ClassPathResource resource = new ClassPathResource("test_audio.webm");
        byte[] inputBytes = FileCopyUtils.copyToByteArray(resource.getInputStream());

        // Cấu hình MockBean trả về key/region SAI
        AzureProps.Speech speechProps = new AzureProps.Speech();
        speechProps.setKey("bad_key_12345");
        speechProps.setRegion("bad_region");
        when(azureProps.getSpeech()).thenReturn(speechProps);

        // --- ACT & ASSERT ---
        Exception exception = assertThrows(Exception.class, () -> {
            speechToTextService.transcribeWav(inputBytes);
        });

        String message = exception.getMessage();
        System.out.println("Lỗi mong đợi (sai key): " + message);
        // Azure ném lỗi CancellationReason.Error
        assertTrue(message.contains("STT Error:"), "Exception message không như mong đợi: " + message);
    }
}
