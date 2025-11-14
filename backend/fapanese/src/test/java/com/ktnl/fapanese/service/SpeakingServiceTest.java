package com.ktnl.fapanese.service;
import com.ktnl.fapanese.dto.request.SpeakingRequest;
import com.ktnl.fapanese.dto.response.SpeakingRespone;
import com.ktnl.fapanese.entity.Speaking;
import com.ktnl.fapanese.entity.enums.SpeakingType;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.SpeakingMapper;
import com.ktnl.fapanese.repository.SpeakingRepository;
import com.ktnl.fapanese.service.implementations.SpeakingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SpeakingServiceTest {

    @Mock
    SpeakingRepository speakingRepository;
    @Mock
    SpeakingMapper speakingMapper;

    @InjectMocks
    SpeakingService speakingService;

    private Speaking dummySpeaking;
    private SpeakingRequest dummyRequest;
    private SpeakingRespone dummyResponse;

    @BeforeEach
    void setUp() {
        dummySpeaking = new Speaking();
        dummySpeaking.setId(1L);
        dummySpeaking.setTopic("Test Speaking"); // <-- Sửa ở đây

        dummyRequest = new SpeakingRequest();
        dummyRequest.setTopic("Test Request");

        dummyResponse = new SpeakingRespone();
        dummyResponse.setId(1L);
        dummyResponse.setTopic("Test Response");
    }

    // ============================================================
    // 1. createSpeaking
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speaking/create_speaking.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: createSpeaking")
    void createSpeaking_Scenarios(String testName) {
        when(speakingMapper.toSpeaking(any(SpeakingRequest.class))).thenReturn(dummySpeaking);
        when(speakingRepository.save(dummySpeaking)).thenReturn(dummySpeaking);
        when(speakingMapper.toSpeakingResponse(dummySpeaking)).thenReturn(dummyResponse);

        SpeakingRespone result = speakingService.createSpeaking(dummyRequest);

        assertNotNull(result);
        assertEquals(dummyResponse.getId(), result.getId());
        verify(speakingRepository, times(1)).save(dummySpeaking);
    }

    // ============================================================
    // 2. getSpeakingById
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speaking/get_speaking_by_id.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getSpeakingById")
    void getSpeakingById_Scenarios(
            String testName,
            Long id,
            boolean speakingFound,
            boolean expectException,
            String expectedError
    ) {
        if (speakingFound) {
            when(speakingRepository.findById(id)).thenReturn(Optional.of(dummySpeaking));
            when(speakingMapper.toSpeakingResponse(dummySpeaking)).thenReturn(dummyResponse);
        } else {
            when(speakingRepository.findById(id)).thenReturn(Optional.empty());
        }

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingService.getSpeakingById(id));
            assertEquals(code, ex.getErrorCode());
        } else {
            SpeakingRespone result = speakingService.getSpeakingById(id);
            assertNotNull(result);
            assertEquals(dummyResponse.getId(), result.getId());
        }
    }

    // ============================================================
    // 3. getAllSpeakings
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speaking/get_all_speakings.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getAllSpeakings")
    void getAllSpeakings_Scenarios(String testName, int repoSize) {
        List<Speaking> list = IntStream.range(0, repoSize)
                .mapToObj(i -> dummySpeaking)
                .collect(Collectors.toList());

        when(speakingRepository.findAll()).thenReturn(list);
        when(speakingMapper.toSpeakingResponse(any(Speaking.class))).thenReturn(dummyResponse);

        List<SpeakingRespone> result = speakingService.getAllSpeakings();

        assertNotNull(result);
        assertEquals(repoSize, result.size());
        verify(speakingMapper, times(repoSize)).toSpeakingResponse(any());
    }

    // ============================================================
    // 4. updateSpeaking
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speaking/update_speaking.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: updateSpeaking")
    void updateSpeaking_Scenarios(
            String testName,
            Long id,
            boolean speakingFound,
            boolean expectException,
            String expectedError
    ) {
        if (speakingFound) {
            when(speakingRepository.findById(id)).thenReturn(Optional.of(dummySpeaking));
        } else {
            when(speakingRepository.findById(id)).thenReturn(Optional.empty());
        }

        when(speakingRepository.save(any(Speaking.class))).thenReturn(dummySpeaking);
        when(speakingMapper.toSpeakingResponse(dummySpeaking)).thenReturn(dummyResponse);

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingService.updateSpeaking(id, dummyRequest));
            assertEquals(code, ex.getErrorCode());
        } else {
            SpeakingRespone result = speakingService.updateSpeaking(id, dummyRequest);
            assertNotNull(result);
            verify(speakingRepository, times(1)).save(dummySpeaking);
            verify(speakingMapper, times(1)).updateSpeaking(dummySpeaking, dummyRequest);
        }
    }

    // ============================================================
    // 5. deleteSpeakingById
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speaking/delete_speaking.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: deleteSpeakingById")
    void deleteSpeakingById_Scenarios(
            String testName,
            Long id,
            boolean speakingExists,
            boolean expectException,
            String expectedError
    ) {
        when(speakingRepository.existsById(id)).thenReturn(speakingExists);

        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedError);
            AppException ex = assertThrows(AppException.class,
                    () -> speakingService.deleteSpeakingById(id));
            assertEquals(code, ex.getErrorCode());
            verify(speakingRepository, never()).deleteById(anyLong());
        } else {
            speakingService.deleteSpeakingById(id);
            verify(speakingRepository, times(1)).deleteById(id);
        }
    }

    // ============================================================
    // 6. getSpeakingsByType
    // ============================================================
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/speaking/get_speakings_by_type.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: getSpeakingsByType")
    void getSpeakingsByType_Scenarios(String testName, int repoSize) {
        SpeakingType type = SpeakingType.PASSAGE;

        List<Speaking> list = IntStream.range(0, repoSize)
                .mapToObj(i -> dummySpeaking)
                .collect(Collectors.toList());

        when(speakingRepository.findByType(type)).thenReturn(list);
        when(speakingMapper.toSpeakingResponse(any(Speaking.class))).thenReturn(dummyResponse);

        List<SpeakingRespone> result = speakingService.getSpeakingsByType(type);

        assertNotNull(result);
        assertEquals(repoSize, result.size());
        verify(speakingMapper, times(repoSize)).toSpeakingResponse(any());
    }
}
