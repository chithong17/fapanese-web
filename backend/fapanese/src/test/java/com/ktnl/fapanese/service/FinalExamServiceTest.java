package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.FinalExamRequest;
import com.ktnl.fapanese.dto.response.FinalExamResponse;
import com.ktnl.fapanese.entity.FinalExam;
import com.ktnl.fapanese.entity.OverviewPart;
import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mapper.FinalExamMapper;
import com.ktnl.fapanese.repository.FinalExamRepository;
import com.ktnl.fapanese.repository.OverviewPartRepository;
import com.ktnl.fapanese.repository.QuestionRepository;
import com.ktnl.fapanese.service.implementations.FinalExamService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinalExamServiceTest {

    // Các dependency cần mock
    @Mock
    private FinalExamRepository finalExamRepository;
    @Mock
    private OverviewPartRepository overviewPartRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private FinalExamMapper finalExamMapper;

    // Lớp service đang được test, tự động tiêm các mock ở trên vào
    @InjectMocks
    private FinalExamService finalExamService;

    // Khai báo các đối tượng mẫu để tái sử dụng
    private FinalExamRequest request;
    private FinalExam exam;
    private FinalExamResponse response;
    private OverviewPart overviewPart;
    private Set<Question> questions;
    private Set<Long> questionIds;

    @BeforeEach
    void setUp() {
        // Khởi tạo các đối tượng mẫu trước mỗi test case

        questionIds = Set.of(1L, 2L);

        request = new FinalExamRequest();
        request.setExamTitle("Test Exam");
        request.setOverviewPartId(10L);
        request.setQuestionIds(questionIds);

        overviewPart = new OverviewPart();
        overviewPart.setId(10L);

        questions = new HashSet<>();
        questions.add(Question.builder().id(1L).content("Q1").build());
        questions.add(Question.builder().id(2L).content("Q2").build());

        exam = new FinalExam();
        exam.setId(1L);
        exam.setExamTitle("Test Exam");
        exam.setOverviewPart(overviewPart);
        exam.setQuestions(questions);

        response = new FinalExamResponse();
        response.setId(1L);
        response.setExamTitle("Test Exam");
        // ... (giả sử response có các trường tương tự)
    }

    // --- 1. Test cho getAllFinalExams ---
    @Test
    @DisplayName("getAllFinalExams - Should return list of exam responses")
    void getAllFinalExams_ShouldReturnListOfExams() {
        // Given: Giả lập repository trả về một danh sách exam
        List<FinalExam> exams = List.of(exam);
        when(finalExamRepository.findAll()).thenReturn(exams);

        // Giả lập mapper chuyển đổi danh sách
        List<FinalExamResponse> responses = List.of(response);
        when(finalExamMapper.toFinalExamResponseList(exams)).thenReturn(responses);

        // When: Gọi phương thức
        List<FinalExamResponse> result = finalExamService.getAllFinalExams();

        // Then: Kiểm tra kết quả
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Exam", result.get(0).getExamTitle());
        verify(finalExamRepository, times(1)).findAll();
        verify(finalExamMapper, times(1)).toFinalExamResponseList(exams);
    }

    // --- 2. Test cho getFinalExamById ---
    @Test
    @DisplayName("getFinalExamById - When Exam Exists - Should Return ExamResponse")
    void getFinalExamById_WhenExamExists_ShouldReturnExam() {
        // Given: Giả lập repository tìm thấy exam
        when(finalExamRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(finalExamMapper.toFinalExamResponse(exam)).thenReturn(response);

        // When: Gọi phương thức
        FinalExamResponse result = finalExamService.getFinalExamById(1L);

        // Then: Kiểm tra kết quả
        assertNotNull(result);
        assertEquals(response, result);
        verify(finalExamRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("getFinalExamById - When Exam Not Found - Should Throw EXAM_NOT_FOUND")
    void getFinalExamById_WhenExamNotFound_ShouldThrowException() {
        // Given: Giả lập repository không tìm thấy exam
        when(finalExamRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then: Kiểm tra exception được ném ra
        AppException exception = assertThrows(AppException.class, () -> {
            finalExamService.getFinalExamById(1L);
        });

        assertEquals(ErrorCode.EXAM_NOT_FOUND, exception.getErrorCode());
        verify(finalExamRepository, times(1)).findById(1L);
        verify(finalExamMapper, never()).toFinalExamResponse(any());
    }

    // --- 3. Test cho createFinalExam ---
    @Test
    @DisplayName("createFinalExam - When Valid Request - Should Save and Return ExamResponse")
    void createFinalExam_ShouldSaveAndReturnExam() {
        // Given: Giả lập các bước trong phương thức create
        FinalExam examToSave = new FinalExam(); // Exam chưa có ID
        when(finalExamMapper.toFinalExam(request)).thenReturn(examToSave);
        when(overviewPartRepository.findById(10L)).thenReturn(Optional.of(overviewPart));
        when(questionRepository.findAllById(questionIds)).thenReturn(List.copyOf(questions));
        when(finalExamRepository.save(examToSave)).thenReturn(exam); // Trả về exam đã có ID
        when(finalExamMapper.toFinalExamResponse(exam)).thenReturn(response);

        // When: Gọi phương thức
        FinalExamResponse result = finalExamService.createFinalExam(request);

        // Then: Kiểm tra kết quả
        assertNotNull(result);
        assertEquals(response, result);

        // Kiểm tra các quan hệ đã được set đúng
        assertEquals(overviewPart, examToSave.getOverviewPart());
        assertEquals(questions, examToSave.getQuestions());

        verify(finalExamMapper, times(1)).toFinalExam(request);
        verify(overviewPartRepository, times(1)).findById(10L);
        verify(questionRepository, times(1)).findAllById(questionIds);
        verify(finalExamRepository, times(1)).save(examToSave);
        verify(finalExamMapper, times(1)).toFinalExamResponse(exam);
    }

    @Test
    @DisplayName("createFinalExam - When OverviewPart Not Found - Should Throw OVERVIEW_PART_NOT_FOUND")
    void createFinalExam_WhenOverviewPartNotFound_ShouldThrowException() {
        // Given: Giả lập OverviewPart không tìm thấy
        when(finalExamMapper.toFinalExam(request)).thenReturn(new FinalExam());
        when(overviewPartRepository.findById(10L)).thenReturn(Optional.empty());

        // When & Then: Kiểm tra exception
        AppException exception = assertThrows(AppException.class, () -> {
            finalExamService.createFinalExam(request);
        });

        assertEquals(ErrorCode.OVERVIEW_PART_NOT_FOUND, exception.getErrorCode());
        verify(finalExamRepository, never()).save(any()); // Đảm bảo không gọi save
        verify(questionRepository, never()).findAllById(any());
    }

    @Test
    @DisplayName("updateFinalExam - When QuestionIds is Null - Should Not Update Questions")
    void updateFinalExam_WhenQuestionIdsIsNull_ShouldNotUpdateQuestions() {
        // Given
        // Yêu cầu KHÔNG chứa questionIds
        request.setQuestionIds(null);

        // Giả lập tìm thấy exam (nó đã có questions từ setUp)
        when(finalExamRepository.findById(1L)).thenReturn(Optional.of(exam));

        // Giả lập mapper và save
        when(finalExamRepository.save(exam)).thenReturn(exam);
        when(finalExamMapper.toFinalExamResponse(exam)).thenReturn(response);

        // When
        finalExamService.updateFinalExam(1L, request);

        // Then
        // Đảm bảo rằng hàm tìm question KHÔNG BAO GIỜ được gọi
        verify(questionRepository, never()).findAllById(any());

        // Đảm bảo rằng 'questions' gốc từ 'exam' không bị thay đổi (vẫn là 2)
        assertNotNull(exam.getQuestions());
        assertEquals(2, exam.getQuestions().size());
    }

    @Test
    @DisplayName("createFinalExam - When QuestionIds is Null or Empty - Should Still Save")
    void createFinalExam_WhenQuestionIdsNullOrEmpty_ShouldSave() {
        // Given
        request.setQuestionIds(null); // Kịch bản null
        FinalExam examToSave = new FinalExam();

        when(finalExamMapper.toFinalExam(request)).thenReturn(examToSave);
        when(overviewPartRepository.findById(10L)).thenReturn(Optional.of(overviewPart));
        when(finalExamRepository.save(examToSave)).thenReturn(exam);
        when(finalExamMapper.toFinalExamResponse(exam)).thenReturn(response);

        // When
        FinalExamResponse result = finalExamService.createFinalExam(request);

        // Then
        assertNotNull(result);
        // Sửa thành
        assertTrue(examToSave.getQuestions().isEmpty());// Questions set phải là null
        verify(questionRepository, never()).findAllById(any()); // Không tìm question
        verify(finalExamRepository, times(1)).save(examToSave);

        // --- Kịch bản empty ---
        request.setQuestionIds(Collections.emptySet());
        reset(finalExamRepository); // Đặt lại mock

        // When
        finalExamService.createFinalExam(request);

        // Then
        // Sửa thành
        assertTrue(examToSave.getQuestions().isEmpty()); // Vẫn là null
        verify(questionRepository, never()).findAllById(any());
        verify(finalExamRepository, times(1)).save(examToSave);
    }


    // --- 4. Test cho updateFinalExam ---
    @Test
    @DisplayName("updateFinalExam - When Exam Exists and Request Valid - Should Update")
    void updateFinalExam_WhenExamExists_ShouldUpdateAndReturnExam() {
        // Given: Giả lập tìm thấy exam cũ
        // Tạo một exam gốc clone
        FinalExam existingExam = new FinalExam();
        existingExam.setId(1L);
        existingExam.setOverviewPart(overviewPart); // overviewPart gốc là ID 10

        when(finalExamRepository.findById(1L)).thenReturn(Optional.of(existingExam));

        // Giả lập tìm thấy OverviewPart mới (ID 20)
        OverviewPart newOverviewPart = new OverviewPart();
        newOverviewPart.setId(20L);
        request.setOverviewPartId(20L); // Cập nhật request

        when(overviewPartRepository.findById(20L)).thenReturn(Optional.of(newOverviewPart));

        // Giả lập tìm thấy questions mới
        when(questionRepository.findAllById(questionIds)).thenReturn(List.copyOf(questions));

        // Giả lập mapper (do updateFinalExam là void)
        doNothing().when(finalExamMapper).updateFinalExam(existingExam, request);

        // Giả lập save
        when(finalExamRepository.save(existingExam)).thenReturn(existingExam); // Trả về chính nó
        when(finalExamMapper.toFinalExamResponse(existingExam)).thenReturn(response);

        // When: Gọi phương thức
        FinalExamResponse result = finalExamService.updateFinalExam(1L, request);

        // Then: Kiểm tra kết quả
        assertNotNull(result);
        assertEquals(response, result);

        // Kiểm tra các phương thức mock đã được gọi
        verify(finalExamRepository, times(1)).findById(1L);
        verify(finalExamMapper, times(1)).updateFinalExam(existingExam, request);
        verify(overviewPartRepository, times(1)).findById(20L); // Đã gọi tìm part mới
        verify(questionRepository, times(1)).findAllById(questionIds);
        verify(finalExamRepository, times(1)).save(existingExam);

        // Kiểm tra trạng thái của đối tượng đã được cập nhật
        assertEquals(newOverviewPart, existingExam.getOverviewPart());
        assertEquals(questions, existingExam.getQuestions());
    }

    @Test
    @DisplayName("updateFinalExam - When OverviewPartId Not Changed - Should Not Fetch OverviewPart")
    void updateFinalExam_WhenPartIdNotChanged_ShouldNotFetchPart() {
        // Given
        // overviewPart gốc có ID 10
        // request cũng có ID 10 (từ @BeforeEach)
        when(finalExamRepository.findById(1L)).thenReturn(Optional.of(exam));

        when(questionRepository.findAllById(questionIds)).thenReturn(List.copyOf(questions));
        when(finalExamRepository.save(exam)).thenReturn(exam);
        when(finalExamMapper.toFinalExamResponse(exam)).thenReturn(response);

        // When
        finalExamService.updateFinalExam(1L, request);

        // Then
        // Quan trọng: Không gọi findById cho OverviewPart
        verify(overviewPartRepository, never()).findById(anyLong());
        verify(finalExamRepository, times(1)).save(exam);
    }


    @Test
    @DisplayName("updateFinalExam - When Exam Not Found - Should Throw EXAM_NOT_FOUND")
    void updateFinalExam_WhenExamNotFound_ShouldThrowException() {
        // Given: Giả lập không tìm thấy exam
        when(finalExamRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then: Kiểm tra exception
        AppException exception = assertThrows(AppException.class, () -> {
            finalExamService.updateFinalExam(1L, request);
        });

        assertEquals(ErrorCode.EXAM_NOT_FOUND, exception.getErrorCode());
        verify(finalExamRepository, never()).save(any());
        verify(finalExamMapper, never()).updateFinalExam(any(), any());
    }

    @Test
    @DisplayName("updateFinalExam - When New OverviewPart Not Found - Should Throw OVERVIEW_PART_NOT_FOUND")
    void updateFinalExam_WhenNewPartNotFound_ShouldThrowException() {
        // Given
        request.setOverviewPartId(20L); // ID mới
        when(finalExamRepository.findById(1L)).thenReturn(Optional.of(exam)); // exam gốc có partId 10

        // Giả lập không tìm thấy Part ID 20
        when(overviewPartRepository.findById(20L)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            finalExamService.updateFinalExam(1L, request);
        });

        assertEquals(ErrorCode.OVERVIEW_PART_NOT_FOUND, exception.getErrorCode());
        verify(finalExamMapper, times(1)).updateFinalExam(exam, request); // Vẫn gọi update trường cơ bản
        verify(finalExamRepository, never()).save(any()); // Không save
    }

    // --- 5. Test cho deleteFinalExam ---
    @Test
    @DisplayName("deleteFinalExam - When Exam Exists - Should Delete Exam")
    void deleteFinalExam_WhenExamExists_ShouldDeleteExam() {
        // Given: Giả lập tìm thấy exam
        when(finalExamRepository.findById(1L)).thenReturn(Optional.of(exam));
        doNothing().when(finalExamRepository).delete(exam); // `delete` là void

        // When: Gọi phương thức
        finalExamService.deleteFinalExam(1L);

        // Then: Kiểm tra phương thức delete đã được gọi
        verify(finalExamRepository, times(1)).findById(1L);
        verify(finalExamRepository, times(1)).delete(exam);
    }

    @Test
    @DisplayName("deleteFinalExam - When Exam Not Found - Should Throw EXAM_NOT_FOUND")
    void deleteFinalExam_WhenExamNotFound_ShouldThrowException() {
        // Given: Giả lập không tìm thấy exam
        when(finalExamRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then: Kiểm tra exception
        AppException exception = assertThrows(AppException.class, () -> {
            finalExamService.deleteFinalExam(1L);
        });

        assertEquals(ErrorCode.EXAM_NOT_FOUND, exception.getErrorCode());
        verify(finalExamRepository, never()).delete(any());
    }

    // --- 6. Test cho getAllFinalExamsByOverviewPartId ---
    @Test
    @DisplayName("getAllFinalExamsByOverviewPartId - When Part Exists - Should Return List")
    void getAllFinalExamsByOverviewPartId_WhenPartExists_ShouldReturnList() {
        // Given
        Long partId = 10L;
        List<FinalExam> exams = List.of(exam);
        List<FinalExamResponse> responses = List.of(response);

        when(overviewPartRepository.existsById(partId)).thenReturn(true);
        when(finalExamRepository.findByOverviewPartId(partId)).thenReturn(exams);
        when(finalExamMapper.toFinalExamResponseList(exams)).thenReturn(responses);

        // When
        List<FinalExamResponse> result = finalExamService.getAllFinalExamsByOverviewPartId(partId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(overviewPartRepository, times(1)).existsById(partId);
        verify(finalExamRepository, times(1)).findByOverviewPartId(partId);
        verify(finalExamMapper, times(1)).toFinalExamResponseList(exams);
    }

    @Test
    @DisplayName("getAllFinalExamsByOverviewPartId - When Part Not Found - Should Throw OVERVIEW_PART_NOT_FOUND")
    void getAllFinalExamsByOverviewPartId_WhenPartNotFound_ShouldThrowException() {
        // Given
        Long partId = 10L;
        when(overviewPartRepository.existsById(partId)).thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            finalExamService.getAllFinalExamsByOverviewPartId(partId);
        });

        assertEquals(ErrorCode.OVERVIEW_PART_NOT_FOUND, exception.getErrorCode());
        verify(finalExamRepository, never()).findByOverviewPartId(any());
        verify(finalExamMapper, never()).toFinalExamResponseList(any());
    }
}