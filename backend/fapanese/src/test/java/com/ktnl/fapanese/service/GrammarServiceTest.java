package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.GrammarDetailRequest;
import com.ktnl.fapanese.dto.request.GrammarRequest;
import com.ktnl.fapanese.dto.response.GrammarDetailResponse;
import com.ktnl.fapanese.dto.response.GrammarResponse;
import com.ktnl.fapanese.entity.Grammar;
import com.ktnl.fapanese.entity.GrammarDetail;
import com.ktnl.fapanese.entity.LessonPart;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.GrammarDetailMapper;
import com.ktnl.fapanese.mapper.GrammarMapper;
import com.ktnl.fapanese.repository.GrammarRepository;
import com.ktnl.fapanese.repository.LessonPartRepository;
import com.ktnl.fapanese.service.implementations.GrammarService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GrammarServiceTest {

    @Mock
    private GrammarRepository grammarRepository;
    @Mock
    private LessonPartRepository lessonPartRepository;
    @Mock
    private GrammarMapper grammarMapper;
    @Mock
    private GrammarDetailMapper detailMapper;

    @InjectMocks
    private GrammarService grammarService;

    // --- Dữ liệu mẫu ---
    private LessonPart lessonPart;
    private GrammarRequest grammarRequest;
    private Grammar grammar;
    private GrammarResponse grammarResponse;
    private GrammarDetailRequest detailRequest1;
    private GrammarDetail detail1;
    private GrammarDetailResponse detailResponse1;


    @BeforeEach
    void setUp() {
        // 1. LessonPart mẫu
        lessonPart = new LessonPart();
        lessonPart.setId(10L);
        lessonPart.setTitle("Phần 1");

        // 2. GrammarDetail mẫu

        // SỬA Ở ĐÂY: Dùng builder của DTO mới bạn vừa cung cấp
        detailRequest1 = GrammarDetailRequest.builder()
                .structure("A は B です")
                .meaning("A là B")
                .exampleSentence("私 は 学生 です")
                .exampleMeaning("Tôi là học sinh")
                .build();

        // Giả lập Entity (detail1) và Response (detailResponse1)
        // (Tôi giả sử các trường này được mapper xử lý,
        // nên tên trường trong mock entity/response không cần khớp 100% với DTO)
        detail1 = GrammarDetail.builder()
                .id(100L)
                .structure("A は B です")
                .meaning("A là B")
                .build();

        // Giả lập Response DTO
        detailResponse1 = new GrammarDetailResponse();
        detailResponse1.setId(100L);
        detailResponse1.setStructure("A は B です");
        detailResponse1.setMeaning("A là B");


        // 3. GrammarRequest (dùng để create/update)
        grammarRequest = new GrammarRequest();
        grammarRequest.setLessonPartId(10L);
        grammarRequest.setTitle("Ngữ pháp N5");
        grammarRequest.setDetails(List.of(detailRequest1));

        // 4. Grammar entity (dữ liệu trong DB)
        grammar = new Grammar();
        grammar.setId(1L);
        grammar.setTitle("Ngữ pháp N5");
        grammar.setLessonPart(lessonPart);
        detail1.setGrammar(grammar);
        grammar.setGrammarDetails(new HashSet<>(Set.of(detail1)));

        // 5. GrammarResponse (dữ liệu trả về)
        grammarResponse = new GrammarResponse();
        grammarResponse.setId(String.valueOf(1L));
        grammarResponse.setTitle("Ngữ pháp N5");
        grammarResponse.setLessonPartId(10L);
        grammarResponse.setDetails(List.of(detailResponse1));
    }

    // --- 1. Test cho createGrammar ---

    @Test
    @DisplayName("createGrammar - When Valid - Should Save and Return Response")
    void createGrammar_WhenValid_ShouldSaveAndReturnResponse() {
        // Given
        when(lessonPartRepository.findById(10L)).thenReturn(Optional.of(lessonPart));

        Grammar grammarToSave = new Grammar();
        when(grammarMapper.toGrammar(grammarRequest)).thenReturn(grammarToSave);

        // Giả lập mapper map từ DTO (có 4 trường) sang Entity (có 4 trường)
        GrammarDetail newDetail = GrammarDetail.builder()
                .structure("A は B です")
                .meaning("A là B")
                .exampleSentence("私 は 学生 です")
                .exampleMeaning("Tôi là học sinh")
                .build();
        when(detailMapper.toGrammarDetail(detailRequest1)).thenReturn(newDetail);

        when(grammarRepository.save(grammarToSave)).thenReturn(grammar);
        when(grammarMapper.toGrammarResponse(grammar)).thenReturn(grammarResponse);

        // When
        GrammarResponse result = grammarService.createGrammar(grammarRequest);

        // Then
        assertNotNull(result);
        assertEquals("Ngữ pháp N5", result.getTitle());

        assertEquals(lessonPart, grammarToSave.getLessonPart());
        assertNotNull(grammarToSave.getGrammarDetails());
        assertEquals(1, grammarToSave.getGrammarDetails().size());
        assertTrue(grammarToSave.getGrammarDetails().stream().allMatch(d -> d.getGrammar() == grammarToSave));

        verify(grammarRepository, times(1)).save(grammarToSave);
    }

    @Test
    @DisplayName("createGrammar - When LessonPart Not Found - Should Throw Exception")
    void createGrammar_WhenLessonPartNotFound_ShouldThrowException() {
        // Given
        when(lessonPartRepository.findById(10L)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            grammarService.createGrammar(grammarRequest);
        });

        assertEquals(ErrorCode.LESSON_PART_NOT_FOUND, exception.getErrorCode());
        verify(grammarRepository, never()).save(any());
    }

    // --- 2. Test cho getAllGrammars ---

    @Test
    @DisplayName("getAllGrammars - Should Return List")
    void getAllGrammars_ShouldReturnList() {
        // Given
        when(grammarRepository.findAll()).thenReturn(List.of(grammar));
        when(grammarMapper.toGrammarResponse(grammar)).thenReturn(grammarResponse);

        // When
        List<GrammarResponse> result = grammarService.getAllGrammars();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(grammarRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllGrammars - When Empty - Should Return Empty List")
    void getAllGrammars_WhenEmpty_ShouldReturnEmptyList() {
        // Given
        when(grammarRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        List<GrammarResponse> result = grammarService.getAllGrammars();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // --- 3. Test cho getGrammarById ---

    @Test
    @DisplayName("getGrammarById - When Found - Should Return Response")
    void getGrammarById_WhenFound_ShouldReturnResponse() {
        // Given
        when(grammarRepository.findById(1L)).thenReturn(Optional.of(grammar));
        when(grammarMapper.toGrammarResponse(grammar)).thenReturn(grammarResponse);

        // When
        GrammarResponse result = grammarService.getGrammarById(1L);

        // Then
        assertNotNull(result);
        assertEquals("1", result.getId());
        verify(grammarRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("getGrammarById - When Not Found - Should Throw Exception")
    void getGrammarById_WhenNotFound_ShouldThrowException() {
        // Given
        when(grammarRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            grammarService.getGrammarById(1L);
        });
        assertEquals(ErrorCode.GRAMMAR_NOT_FOUND, exception.getErrorCode());
    }

    // --- 4. Test cho getGrammarsByLessonPart ---

    @Test
    @DisplayName("getGrammarsByLessonPart - When Part Exists - Should Return List")
    void getGrammarsByLessonPart_WhenPartExists_ShouldReturnList() {
        // Given
        when(lessonPartRepository.existsById(10L)).thenReturn(true);
        when(grammarRepository.findByLessonPart_Id(10L)).thenReturn(List.of(grammar));
        when(grammarMapper.toGrammarResponse(grammar)).thenReturn(grammarResponse);

        // When
        List<GrammarResponse> result = grammarService.getGrammarsByLessonPart(10L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(lessonPartRepository, times(1)).existsById(10L);
        verify(grammarRepository, times(1)).findByLessonPart_Id(10L);
    }

    @Test
    @DisplayName("createGrammar - When Details is Null - Should Save Without Details")
    void createGrammar_WhenDetailsIsNull_ShouldSaveWithoutDetails() {
        // Given
        grammarRequest.setDetails(null); // Set details to null

        when(lessonPartRepository.findById(10L)).thenReturn(Optional.of(lessonPart));

        Grammar grammarToSave = new Grammar();
        when(grammarMapper.toGrammar(grammarRequest)).thenReturn(grammarToSave);

        when(grammarRepository.save(grammarToSave)).thenReturn(grammar);
        when(grammarMapper.toGrammarResponse(grammar)).thenReturn(grammarResponse);

        // When
        grammarService.createGrammar(grammarRequest);

        // Then
        // Logic code của bạn sẽ không khởi tạo grammarDetails
        assertTrue(grammarToSave.getGrammarDetails().isEmpty());
        verify(detailMapper, never()).toGrammarDetail(any());
        verify(grammarRepository, times(1)).save(grammarToSave);
    }

    @Test
    @DisplayName("updateGrammar - When Grammar Not Found - Should Throw Exception")
    void updateGrammar_WhenGrammarNotFound_ShouldThrowException() {
        // Given
        when(grammarRepository.findById(99L)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            grammarService.updateGrammar(99L, grammarRequest);
        });
        assertEquals(ErrorCode.GRAMMAR_NOT_FOUND, exception.getErrorCode());
        verify(grammarRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateGrammar - When LessonPartId Not Changed - Should Not Fetch LessonPart")
    void updateGrammar_WhenLessonPartIdNotChanged_ShouldNotFetchLessonPart() {
        // Given
        // Cả request (10L) và entity 'grammar' (10L) đều có cùng Part ID
        when(grammarRepository.findById(1L)).thenReturn(Optional.of(grammar));
        when(grammarRepository.save(grammar)).thenReturn(grammar);
        when(grammarMapper.toGrammarResponse(grammar)).thenReturn(grammarResponse);

        // --- SỬA Ở ĐÂY: THÊM DÒNG MOCK BỊ THIẾU ---
        // Phải thêm dòng này vì `grammarRequest` (từ setUp) có 1 detail mới
        // và code sẽ đi vào nhánh "else" (thêm detail mới)
        when(detailMapper.toGrammarDetail(any(GrammarDetailRequest.class)))
                .thenReturn(new GrammarDetail()); // Trả về 1 object, không phải null

        // --- WHEN ---
        grammarService.updateGrammar(1L, grammarRequest); // Dòng 299

        // --- THEN ---
        // Đảm bảo không gọi findById cho LessonPart
        verify(lessonPartRepository, never()).findById(anyLong());
        verify(grammarRepository, times(1)).save(grammar);
    }

    @Test
    @DisplayName("getGrammarsByLessonPart - When Part Not Found - Should Throw Exception")
    void getGrammarsByLessonPart_WhenPartNotFound_ShouldThrowException() {
        // Given
        when(lessonPartRepository.existsById(10L)).thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            grammarService.getGrammarsByLessonPart(10L);
        });

        assertEquals(ErrorCode.LESSON_PART_NOT_FOUND, exception.getErrorCode());
        verify(grammarRepository, never()).findByLessonPart_Id(anyLong());
    }

    // --- 5. Test cho deleteGrammar ---

    @Test
    @DisplayName("deleteGrammar - When Found - Should Delete")
    void deleteGrammar_WhenFound_ShouldDelete() {
        // Given
        when(grammarRepository.existsById(1L)).thenReturn(true);
        doNothing().when(grammarRepository).deleteById(1L);

        // When
        grammarService.deleteGrammar(1L);

        // Then
        verify(grammarRepository, times(1)).existsById(1L);
        verify(grammarRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("deleteGrammar - When Not Found - Should Throw Exception")
    void deleteGrammar_WhenNotFound_ShouldThrowException() {
        // Given
        when(grammarRepository.existsById(1L)).thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            grammarService.deleteGrammar(1L);
        });

        assertEquals(ErrorCode.GRAMMAR_NOT_FOUND, exception.getErrorCode());
        verify(grammarRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("updateGrammar - When Existing LessonPart is Null - Should Update Part")
    void updateGrammar_WhenExistingLessonPartIsNull_ShouldUpdatePart() {
        // --- GIVEN ---
        // 1. Mock Grammar cũ không có LessonPart
        Grammar existingGrammar = new Grammar();
        existingGrammar.setId(1L);
        existingGrammar.setLessonPart(null); // LessonPart đang là null
        existingGrammar.setGrammarDetails(new HashSet<>()); // Set rỗng cho đơn giản

        when(grammarRepository.findById(1L)).thenReturn(Optional.of(existingGrammar));

        // 2. Mock LessonPart mới (ID 20)
        LessonPart newLessonPart = new LessonPart();
        newLessonPart.setId(20L);
        when(lessonPartRepository.findById(20L)).thenReturn(Optional.of(newLessonPart));

        // 3. Request muốn gán vào Part 20
        GrammarRequest updateRequest = new GrammarRequest();
        updateRequest.setLessonPartId(20L);
        updateRequest.setDetails(null); // Không quan tâm detail

        // 4. Giả lập
        when(grammarRepository.save(existingGrammar)).thenReturn(existingGrammar);
        when(grammarMapper.toGrammarResponse(existingGrammar)).thenReturn(grammarResponse);

        // --- WHEN ---
        grammarService.updateGrammar(1L, updateRequest);

        // --- THEN ---
        // Logic (existingGrammar.getLessonPart() == null) sẽ là TRUE
        // và code sẽ chạy vào bên trong 'if'

        // 1. Đã tìm Part mới
        verify(lessonPartRepository, times(1)).findById(20L);

        // 2. Part mới đã được gán
        assertEquals(newLessonPart, existingGrammar.getLessonPart());

        // 3. Đã gọi save
        verify(grammarRepository, times(1)).save(existingGrammar);
    }

    @Test
    @DisplayName("updateGrammar - When Details is Null - Should Clear All Details")
    void updateGrammar_WhenDetailsIsNull_ShouldClearAllDetails() {
        // Given
        grammarRequest.setDetails(null); // Request không có detail

        // grammar (entity) đang có 1 detail (từ setUp)
        when(grammarRepository.findById(1L)).thenReturn(Optional.of(grammar));

        // Giả lập LessonPart không thay đổi
        grammarRequest.setLessonPartId(10L);

        when(grammarRepository.save(grammar)).thenReturn(grammar);
        when(grammarMapper.toGrammarResponse(grammar)).thenReturn(grammarResponse);

        // When
        grammarService.updateGrammar(1L, grammarRequest);

        // Then
        // Logic của bạn (existingGrammar.getGrammarDetails().clear())
        // sẽ làm cho Set này rỗng
        assertTrue(grammar.getGrammarDetails().isEmpty());
        verify(grammarRepository, times(1)).save(grammar);
    }

    // --- 6. Test cho updateGrammar (Kịch bản phức tạp) ---

    @Test
    @DisplayName("updateGrammar - Should Update, Add, and Remove Details Correctly")
    void updateGrammar_ShouldUpdateAddAndRemoveDetails() {
        // --- GIVEN ---

        LessonPart newLessonPart = new LessonPart();
        newLessonPart.setId(20L);

        // 2. Entity đang tồn tại
        GrammarDetail detailToUpdate = GrammarDetail.builder().id(100L).structure("Cũ").build();
        GrammarDetail detailToRemove = GrammarDetail.builder().id(101L).structure("Xóa đi").build();

        Grammar existingGrammar = new Grammar();
        existingGrammar.setId(1L);
        existingGrammar.setLessonPart(lessonPart); // Part 10
        existingGrammar.setGrammarDetails(new HashSet<>(Set.of(detailToUpdate, detailToRemove)));
        detailToUpdate.setGrammar(existingGrammar);
        detailToRemove.setGrammar(existingGrammar);

        when(grammarRepository.findById(1L)).thenReturn(Optional.of(existingGrammar));

        // 3. Request mới
        // SỬA Ở ĐÂY: Dùng builder của DTO mới
        GrammarDetailRequest updateDetailRequest = GrammarDetailRequest.builder()
                .id(100L) // Trùng ID với detailToUpdate
                .structure("Cấu trúc mới")
                .meaning("Nghĩa mới")
                .build();

        // SỬA Ở ĐÂY: Dùng builder của DTO mới
        GrammarDetailRequest newDetailRequest = GrammarDetailRequest.builder()
                .structure("Cấu trúc thêm")
                .meaning("Nghĩa thêm")
                .build();

        GrammarRequest updateRequest = new GrammarRequest();
        updateRequest.setLessonPartId(20L); // Đổi sang part mới
        updateRequest.setTitle("Tiêu đề mới");
        updateRequest.setDetails(List.of(updateDetailRequest, newDetailRequest));

        // 4. Giả lập
        when(lessonPartRepository.findById(20L)).thenReturn(Optional.of(newLessonPart));
        doNothing().when(grammarMapper).updateGrammar(any(Grammar.class), any(GrammarRequest.class));

        doNothing().when(detailMapper).updateGrammarDetail(detailToUpdate, updateDetailRequest);

        // Giả lập cho newDetailRequest (ID null)
        GrammarDetail newAddedDetail = GrammarDetail.builder().structure("Cấu trúc thêm").build();
        when(detailMapper.toGrammarDetail(newDetailRequest)).thenReturn(newAddedDetail);

        when(grammarRepository.save(existingGrammar)).thenReturn(existingGrammar);
        when(grammarMapper.toGrammarResponse(existingGrammar)).thenReturn(grammarResponse);

        // --- WHEN ---
        GrammarResponse result = grammarService.updateGrammar(1L, updateRequest);

        // --- THEN ---
        assertNotNull(result);

        // 1. Kiểm tra LessonPart
        verify(lessonPartRepository, times(1)).findById(20L);
        assertEquals(newLessonPart, existingGrammar.getLessonPart());

        // 2. Kiểm tra mapper cơ bản
        verify(grammarMapper, times(1)).updateGrammar(existingGrammar, updateRequest);

        // 3. Kiểm tra mapper detail
        verify(detailMapper, times(1)).updateGrammarDetail(detailToUpdate, updateDetailRequest);
        verify(detailMapper, times(1)).toGrammarDetail(newDetailRequest);

        // 4. Kiểm tra trạng thái cuối cùng của Set details
        Set<GrammarDetail> finalDetails = existingGrammar.getGrammarDetails();
        assertEquals(2, finalDetails.size());
        assertTrue(finalDetails.contains(detailToUpdate));
        assertTrue(finalDetails.contains(newAddedDetail));
        assertFalse(finalDetails.contains(detailToRemove));

        assertTrue(newAddedDetail.getGrammar() == existingGrammar);

        verify(grammarRepository, times(1)).save(existingGrammar);
    }
}