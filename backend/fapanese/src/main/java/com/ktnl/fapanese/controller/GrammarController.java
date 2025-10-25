package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.GrammarRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.GrammarResponse;
import com.ktnl.fapanese.service.interfaces.IGrammarService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/grammars")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class GrammarController {
    private final IGrammarService grammarService;

    @PostMapping
    public ApiResponse<GrammarResponse> createGrammar(@RequestBody GrammarRequest request) {
        GrammarResponse result = grammarService.createGrammar(request);
        return ApiResponse.<GrammarResponse>builder()
                .message("Grammar created successfully")
                .result(result)
                .build();
    }

    @GetMapping
    public ApiResponse<List<GrammarResponse>> getAllGrammars() {
        List<GrammarResponse> result = grammarService.getAllGrammars();
        return ApiResponse.<List<GrammarResponse>>builder()
                .message("Grammars fetched successfully")
                .result(result)
                .build();
    }

    @GetMapping("/by-lesson/{lessonId}")
    public ApiResponse<List<GrammarResponse>> getGrammarsByLesson(@PathVariable("lessonId") Long lessonPartId) {
        List<GrammarResponse> result = grammarService.getGrammarsByLessonPart(lessonPartId);
        return ApiResponse.<List<GrammarResponse>>builder()
                .message("Grammars fetched successfully for lesson " + lessonPartId)
                .result(result)
                .build();
    }

    @GetMapping("/{grammarId}")
    public ApiResponse<GrammarResponse> getGrammarById(@PathVariable("grammarId") Long grammarId) {
        GrammarResponse result = grammarService.getGrammarById(grammarId);
        return ApiResponse.<GrammarResponse>builder()
                .message("Grammar fetched successfully")
                .result(result)
                .build();
    }

    @PutMapping("/{grammarId}")
    public ApiResponse<GrammarResponse> updateGrammar(@PathVariable("grammarId") Long grammarId, @RequestBody GrammarRequest request) {
        GrammarResponse result = grammarService.updateGrammar(grammarId, request);
        return ApiResponse.<GrammarResponse>builder()
                .message("Grammar updated successfully")
                .result(result)
                .build();
    }

    @DeleteMapping("/{grammarId}")
    public ApiResponse<Void> deleteGrammar(@PathVariable("grammarId") Long grammarId) {
        grammarService.deleteGrammar(grammarId);
        return ApiResponse.<Void>builder()
                .message("Grammar deleted successfully")
                .build();
    }

    @GetMapping("/by-lesson-part/{lessonPartId}")
    public ApiResponse<List<GrammarResponse>> getGrammarsByLessonPart(@PathVariable("lessonPartId") Long lessonPartId) {
        List<GrammarResponse> result = grammarService.getGrammarsByLessonPart(lessonPartId);
        return ApiResponse.<List<GrammarResponse>>builder()
                .message("Grammars fetched successfully for LessonPart " + lessonPartId)
                .result(result)
                .build();
    }
}
