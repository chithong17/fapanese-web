package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.OverviewPartRequest;
import com.ktnl.fapanese.dto.response.OverviewPartResponse;
import com.ktnl.fapanese.entity.Overview;
import com.ktnl.fapanese.entity.OverviewPart;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.OverviewPartMapper;
import com.ktnl.fapanese.repository.OverviewPartRepository;
import com.ktnl.fapanese.repository.OverviewRepository;
import com.ktnl.fapanese.service.implementations.OverviewPartService;
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

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OverviewPartServiceTest {

    @Mock
    private OverviewPartRepository overviewPartRepository;
    @Mock
    private OverviewRepository overviewRepository;
    @Mock
    private OverviewPartMapper overviewPartMapper;

    @InjectMocks
    private OverviewPartService overviewPartService;

    // --- Dữ liệu mẫu ---
    private OverviewPartRequest mockRequest;
    private Overview mockOverview; // Cha
    private Overview mockNewOverview; // Cha mới (để update)
    private OverviewPart mockOverviewPart; // Con
    private OverviewPartResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockOverview = new Overview();
        // ID sẽ được set trong từng kịch bản test

        mockNewOverview = new Overview();
        mockNewOverview.setId(20L); // ID của cha mới

        mockOverviewPart = new OverviewPart();
        mockOverviewPart.setId(1L);
        mockOverviewPart.setOverview(mockOverview); // Gán cha

        // Giả lập DTO
        mockRequest = new OverviewPartRequest();
        mockRequest.setTitle("Test Part");
        // ID overview sẽ được set trong từng kịch bản test

        mockResponse = new OverviewPartResponse();
        mockResponse.setId(1L);
        mockResponse.setTitle("Test Part");
    }

    // --- 1. getAllOverviewParts ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overviewpart/get_all_overview_parts_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getAllOverviewParts")
    void getAllOverviewParts_Scenarios(String testName, int repoReturnsSize) {
        // Arrange
        List<OverviewPart> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockOverviewPart)
                .collect(Collectors.toList());
        List<OverviewPartResponse> mockResponseList = Collections.nCopies(repoReturnsSize, mockResponse);

        when(overviewPartRepository.findAll()).thenReturn(mockList);
        when(overviewPartMapper.toOverviewPartResponseList(mockList)).thenReturn(mockResponseList);

        // Act
        List<OverviewPartResponse> result = overviewPartService.getAllOverviewParts();

        // Assert
        assertNotNull(result);
        assertEquals(repoReturnsSize, result.size());
        verify(overviewPartRepository, times(1)).findAll();
    }

    // --- 2. getOverviewPartById ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overviewpart/get_overview_part_by_id_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getOverviewPartById")
    void getOverviewPartById_Scenarios(String testName, Long partId, boolean mockPartFound,
                                       boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockPartFound) {
            when(overviewPartRepository.findById(partId)).thenReturn(Optional.of(mockOverviewPart));
            when(overviewPartMapper.toOverviewPartResponse(mockOverviewPart)).thenReturn(mockResponse);
        } else {
            when(overviewPartRepository.findById(partId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> overviewPartService.getOverviewPartById(partId));
            assertEquals(code, e.getErrorCode());
        } else {
            OverviewPartResponse result = overviewPartService.getOverviewPartById(partId);
            assertNotNull(result);
            assertEquals(mockResponse.getId(), result.getId());
        }
        verify(overviewPartRepository, times(1)).findById(partId);
    }

    // --- 3. createOverviewPart ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overviewpart/create_overview_part_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản createOverviewPart")
    void createOverviewPart_Scenarios(String testName, Long overviewId, boolean mockOverviewFound,
                                      boolean expectException, String expectedErrorCodeString) {
        // Arrange
        mockRequest.setOverviewId(overviewId);

        if (mockOverviewFound) {
            mockOverview.setId(overviewId); // Gán ID cho cha
            when(overviewRepository.findById(overviewId)).thenReturn(Optional.of(mockOverview));
        } else {
            when(overviewRepository.findById(overviewId)).thenReturn(Optional.empty());
        }

        OverviewPart partToSave = new OverviewPart(); // Entity rỗng
        when(overviewPartMapper.toOverviewPart(mockRequest)).thenReturn(partToSave);
        when(overviewPartRepository.save(partToSave)).thenReturn(mockOverviewPart);
        when(overviewPartMapper.toOverviewPartResponse(mockOverviewPart)).thenReturn(mockResponse);

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> overviewPartService.createOverviewPart(mockRequest));
            assertEquals(code, e.getErrorCode());
            verify(overviewPartRepository, never()).save(any());
        } else {
            OverviewPartResponse result = overviewPartService.createOverviewPart(mockRequest);
            assertNotNull(result);
            // Kiểm tra quan hệ cha-con đã được gán
            assertEquals(mockOverview, partToSave.getOverview());
            verify(overviewPartRepository, times(1)).save(partToSave);
        }
    }

    // --- 4. updateOverviewPart ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overviewpart/update_overview_part_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản updateOverviewPart")
    void updateOverviewPart_Scenarios(String testName, Long partId, boolean mockPartFound,
                                      Long currentOverviewId, Long newOverviewId, boolean mockNewOverviewFound,
                                      boolean expectException, String expectedErrorCodeString) {
        // Arrange
        mockRequest.setOverviewId(newOverviewId);

        // Mock cha cũ
        mockOverview.setId(currentOverviewId);
        mockOverviewPart.setOverview(mockOverview); // Gán cha cũ vào part

        if (mockPartFound) {
            when(overviewPartRepository.findById(partId)).thenReturn(Optional.of(mockOverviewPart));
        } else {
            when(overviewPartRepository.findById(partId)).thenReturn(Optional.empty());
        }

        boolean changingOverview = !currentOverviewId.equals(newOverviewId);

        if (changingOverview) {
            if (mockNewOverviewFound) {
                mockNewOverview.setId(newOverviewId); // Gán ID cho cha mới
                when(overviewRepository.findById(newOverviewId)).thenReturn(Optional.of(mockNewOverview));
            } else {
                when(overviewRepository.findById(newOverviewId)).thenReturn(Optional.empty());
            }
        }

        if (!expectException) {
            when(overviewPartRepository.save(mockOverviewPart)).thenReturn(mockOverviewPart);
            when(overviewPartMapper.toOverviewPartResponse(mockOverviewPart)).thenReturn(mockResponse);
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> overviewPartService.updateOverviewPart(partId, mockRequest));
            assertEquals(code, e.getErrorCode());
            verify(overviewPartRepository, never()).save(any());
        } else {
            OverviewPartResponse result = overviewPartService.updateOverviewPart(partId, mockRequest);
            assertNotNull(result);

            verify(overviewPartMapper, times(1)).updateOverviewPart(mockOverviewPart, mockRequest);

            if (changingOverview) {
                verify(overviewRepository, times(1)).findById(newOverviewId);
                assertEquals(mockNewOverview, mockOverviewPart.getOverview()); // Đã gán cha mới
            } else {
                verify(overviewRepository, never()).findById(anyLong());
                assertEquals(mockOverview, mockOverviewPart.getOverview()); // Vẫn là cha cũ
            }

            verify(overviewPartRepository, times(1)).save(mockOverviewPart);
        }
    }

    // --- 5. deleteOverviewPart ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overviewpart/delete_overview_part_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản deleteOverviewPart")
    void deleteOverviewPart_Scenarios(String testName, Long partId, boolean mockPartFound,
                                      boolean expectException, String expectedErrorCodeString) {
        // Arrange
        if (mockPartFound) {
            when(overviewPartRepository.findById(partId)).thenReturn(Optional.of(mockOverviewPart));
        } else {
            when(overviewPartRepository.findById(partId)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> overviewPartService.deleteOverviewPart(partId));
            assertEquals(code, e.getErrorCode());
            verify(overviewPartRepository, never()).delete(any());
        } else {
            overviewPartService.deleteOverviewPart(partId);
            verify(overviewPartRepository, times(1)).delete(mockOverviewPart);
        }
    }

    // --- 6. getOverviewPartByOverview ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/overviewpart/get_overview_part_by_overview_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản getOverviewPartByOverview")
    void getOverviewPartByOverview_Scenarios(String testName, Long overviewId, boolean mockOverviewExists,
                                             int repoReturnsSize, boolean expectException, String expectedErrorCodeString) {
        // Arrange
        when(overviewRepository.existsById(overviewId)).thenReturn(mockOverviewExists);

        List<OverviewPart> mockList = IntStream.range(0, repoReturnsSize)
                .mapToObj(i -> mockOverviewPart)
                .collect(Collectors.toList());
        List<OverviewPartResponse> mockResponseList = Collections.nCopies(repoReturnsSize, mockResponse);

        when(overviewPartRepository.findByOverviewId(overviewId)).thenReturn(mockList);
        when(overviewPartMapper.toOverviewPartResponseList(mockList)).thenReturn(mockResponseList);

        // Act & Assert
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCodeString);
            AppException e = assertThrows(AppException.class, () -> overviewPartService.getOverviewPartByOverview(overviewId));
            assertEquals(code, e.getErrorCode());
            verify(overviewPartRepository, never()).findByOverviewId(anyLong());
        } else {
            List<OverviewPartResponse> result = overviewPartService.getOverviewPartByOverview(overviewId);
            assertNotNull(result);
            assertEquals(repoReturnsSize, result.size());
            verify(overviewPartRepository, times(1)).findByOverviewId(overviewId);
        }
    }
}
