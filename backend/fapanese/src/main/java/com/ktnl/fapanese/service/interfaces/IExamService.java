package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.request.UserAnswer;
import com.ktnl.fapanese.dto.response.SubmitQuizResponse;

import java.util.List;

public interface IExamService {
    SubmitQuizResponse checkAndSubmitExamAnswers(List<UserAnswer> userAnswers);
}
