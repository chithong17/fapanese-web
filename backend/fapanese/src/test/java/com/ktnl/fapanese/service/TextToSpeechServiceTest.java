package com.ktnl.fapanese.service;

import com.ktnl.fapanese.configuration.AzureProps;
import com.ktnl.fapanese.service.implementations.TextToSpeechService;
import com.microsoft.cognitiveservices.speech.*;
import lombok.SneakyThrows;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.lang.reflect.Method;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TextToSpeechServiceTest {

    @Mock
    private AzureProps props;
    @Mock
    private AzureProps.Speech speechProps;

    @InjectMocks
    private TextToSpeechService textToSpeechService;

    // Mocks cho Azure SDK
    private MockedStatic<SpeechConfig> staticSpeechConfig;
    private MockedStatic<SpeechSynthesisCancellationDetails> staticCancellationDetails;
    private MockedConstruction<SpeechSynthesizer> synthConstruction;

    // Xóa @Mock ở đây, chúng sẽ được khởi tạo trong constructor
    private SpeechConfig mockConfig;
    private SpeechSynthesizer mockSynthesizer;

    @Mock
    private SpeechSynthesisResult mockResult;
    @Mock
    private SpeechSynthesisCancellationDetails mockDetails;

    @Captor
    private ArgumentCaptor<String> ssmlCaptor;

    private CompletableFuture<SpeechSynthesisResult> future;

    @BeforeEach
    void setUp() {
        // Cấu hình AzureProps
        when(props.getSpeech()).thenReturn(speechProps);
        when(speechProps.getKey()).thenReturn("dummy-key");
        when(speechProps.getRegion()).thenReturn("dummy-region");

        future = CompletableFuture.completedFuture(mockResult);

        // 1. Mock static method SpeechConfig.fromSubscription(...)
        staticSpeechConfig = Mockito.mockStatic(SpeechConfig.class);
        staticSpeechConfig.when(() -> SpeechConfig.fromSubscription(anyString(), anyString()))
                .thenAnswer(invocation -> {
                    mockConfig = Mockito.mock(SpeechConfig.class); // Tạo mock
                    return mockConfig; // Trả về
                });

        // 2. Mock static method SpeechSynthesisCancellationDetails.fromResult(...)
        staticCancellationDetails = Mockito.mockStatic(SpeechSynthesisCancellationDetails.class);
        staticCancellationDetails.when(() -> SpeechSynthesisCancellationDetails.fromResult(mockResult))
                .thenReturn(mockDetails);

        // 3. Mock constructor `new SpeechSynthesizer(...)`
        // ⭐ SỬA LỖI CHÍNH: Chuyển TẤT CẢ các when() vào đây
        synthConstruction = Mockito.mockConstruction(SpeechSynthesizer.class,
                (mock, context) -> {
                    // Set up TẤT CẢ hành vi của mockSynthesizer ở đây
                    when(mock.SpeakTextAsync(anyString())).thenReturn(future);
                    // Dùng captor ngay tại đây
                    when(mock.SpeakSsmlAsync(ssmlCaptor.capture())).thenReturn(future);

                    mockSynthesizer = mock; // Gán mock này cho biến class
                });
    }

    @AfterEach
    void tearDown() {
        staticSpeechConfig.close();
        staticCancellationDetails.close();
        synthConstruction.close();
    }

    // ============================================================
    // PHẦN 1: TEST CÁC PHƯƠNG THỨC PUBLIC
    // ============================================================

    @Test
    @DisplayName("synthJa - Success")
    void synthJa_Success() throws Exception {
        // --- ARRANGE ---
        byte[] dummyAudio = new byte[]{1, 2, 3};
        when(mockResult.getReason()).thenReturn(ResultReason.SynthesizingAudioCompleted);
        when(mockResult.getAudioData()).thenReturn(dummyAudio);

        // Không cần when(mockSynthesizer...) ở đây nữa

        // --- ACT ---
        byte[] result = textToSpeechService.synthJa("こんにちは");

        // --- ASSERT ---
        assertNotNull(result);
        assertEquals(dummyAudio, result);
    }

    @Test
    @DisplayName("synthJa - Canceled")
    void synthJa_Canceled() {
        // --- ARRANGE ---
        when(mockResult.getReason()).thenReturn(ResultReason.Canceled);
        when(mockDetails.getErrorDetails()).thenReturn("API key is wrong");

        // --- ACT & ASSERT ---
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> textToSpeechService.synthJa("こんにちは"));

        assertTrue(ex.getMessage().contains("API key is wrong"));
    }

    @Test
    @DisplayName("synthJa - Failed (NoMatch Reason)")
    void synthJa_Failed() {
        // --- ARRANGE ---
        when(mockResult.getReason()).thenReturn(ResultReason.NoMatch);

        // --- ACT & ASSERT ---
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> textToSpeechService.synthJa("こんにちは"));

        assertTrue(ex.getMessage().contains("TTS failed"));
    }

    @Test
    @DisplayName("synthSsmlPolyglot - Success and Captures SSML")
    void synthSsmlPolyglot_Success() throws Exception {
        // --- ARRANGE ---
        byte[] dummyAudio = new byte[]{1, 2, 3};
        String inputText = "Xin chào [JA:こんにちは:JA]";

        when(mockResult.getReason()).thenReturn(ResultReason.SynthesizingAudioCompleted);
        when(mockResult.getAudioData()).thenReturn(dummyAudio);

        // Không cần when(mockSynthesizer...) ở đây nữa

        // --- ACT ---
        byte[] result = textToSpeechService.synthSsmlPolyglot(inputText);

        // --- ASSERT ---
        assertNotNull(result);
        assertEquals(dummyAudio, result);

        String capturedSsml = ssmlCaptor.getValue(); // Sẽ hoạt động
        assertNotNull(capturedSsml);
        assertTrue(capturedSsml.contains("<voice name='vi-VN-HoaiMyNeural'>Xin chào </voice>"));
        assertTrue(capturedSsml.contains("<voice name='ja-JP-NanamiNeural'>こんにちは</voice>"));
    }

    @Test
    @DisplayName("synthSsmlPolyglot - Canceled")
    void synthSsmlPolyglot_Canceled() {
        // --- ARRANGE ---
        when(mockResult.getReason()).thenReturn(ResultReason.Canceled);
        when(mockDetails.getErrorDetails()).thenReturn("SSML is invalid");
        when(mockDetails.getErrorCode()).thenReturn(CancellationErrorCode.BadRequest);

        // --- ACT & ASSERT ---
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> textToSpeechService.synthSsmlPolyglot("..."));

        assertTrue(ex.getMessage().contains("SSML is invalid"));
    }

    @Test
    @DisplayName("synthSsmlPolyglot - Failed (NoMatch Reason)")
    void synthSsmlPolyglot_Failed() {
        // --- ARRANGE ---
        when(mockResult.getReason()).thenReturn(ResultReason.NoMatch);

        // --- ACT & ASSERT ---
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> textToSpeechService.synthSsmlPolyglot("..."));

        assertTrue(ex.getMessage().contains("TTS failed with unknown reason: NoMatch"));
    }

    // ============================================================
    // PHẦN 2: TEST CÁC PHƯƠNG THỨC PRIVATE
    // ============================================================

    @SneakyThrows
    private String invokePrivateMethod(String methodName, String parameter) {
        Method method = TextToSpeechService.class.getDeclaredMethod(methodName, String.class);
        method.setAccessible(true);
        return (String) method.invoke(textToSpeechService, parameter);
    }

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/tts/escape_ssml.csv",
            numLinesToSkip = 1,
            nullValues = {"null"}
    )
    @DisplayName("Data-driven: escapeSsml")
    void escapeSsml_Scenarios(String testName, String input, String expected) {
        String result = invokePrivateMethod("escapeSsml", input);
        assertEquals(expected, result);
    }

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/tts/create_ssml.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: createPolyglotSsml")
    void createPolyglotSsml_Scenarios(String testName, String input, String expected) {
        String result = invokePrivateMethod("createPolyglotSsml", input);

        String expectedFullSsml = String.format(
                "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'>%s</speak>",
                expected
        );
        assertEquals(expectedFullSsml, result);
    }
}