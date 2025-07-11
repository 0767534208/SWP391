import api, { qnaAPI } from '../utils/api';
import type { 
  ApiResponse, 
  Question, 
  QuestionResponse, 
  Answer, 
  CreateQuestionRequest, 
  CreateAnswerRequest, 
  UpdateQuestionStatusRequest,
  VoteRequest, 
  PaginationParams, 
  PaginatedResponse
} from '../types';

/**
 * Service for handling QnA functionality
 */
const qnaService = {
  /**
   * Get all questions (public and approved)
   */
  getAllQuestions: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Question>>> => {
    return qnaAPI.getAllQuestions(params);
  },
  
  /**
   * Get a specific question by ID with its answers
   */
  getQuestion: async (questionId: number): Promise<ApiResponse<QuestionResponse>> => {
    return qnaAPI.getQuestionById(questionId);
  },
  
  /**
   * Create a new question
   */
  createQuestion: async (questionData: CreateQuestionRequest): Promise<ApiResponse<Question>> => {
    return qnaAPI.createQuestion(questionData);
  },
  
  /**
   * Get all messages for a question
   */
  getQuestionMessages: async (questionId: number): Promise<ApiResponse<Answer[]>> => {
    return qnaAPI.getMessages(questionId);
  },
  
  /**
   * Add a message/answer to a question
   */
  addMessage: async (questionId: number, messageData: CreateAnswerRequest): Promise<ApiResponse<Answer>> => {
    return qnaAPI.createMessage(questionId, messageData);
  },
  
  /**
   * Update question status (for admin/moderator)
   */
  updateQuestionStatus: async (questionId: number, statusData: UpdateQuestionStatusRequest): Promise<ApiResponse<Question>> => {
    return qnaAPI.updateQuestionStatus(questionId, statusData);
  },
  
  /**
   * Vote on a question
   */
  voteQuestion: async (questionId: number, voteData: VoteRequest): Promise<ApiResponse<Question>> => {
    return qnaAPI.voteQuestion(questionId, voteData);
  },
  
  /**
   * Vote on an answer
   */
  voteAnswer: async (answerId: number, voteData: VoteRequest): Promise<ApiResponse<Answer>> => {
    return qnaAPI.voteAnswer(answerId, voteData);
  },
  
  /**
   * Get questions by category
   */
  getQuestionsByCategory: async (category: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Question>>> => {
    return qnaAPI.getQuestionsByCategory(category, params);
  },
  
  /**
   * Get questions by user
   */
  getUserQuestions: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Question>>> => {
    return qnaAPI.getUserQuestions(params);
  },
  
  /**
   * Mark an answer as verified (for consultants/admins)
   */
  verifyAnswer: async (answerId: number): Promise<ApiResponse<Answer>> => {
    return qnaAPI.verifyAnswer(answerId);
  },
  
  /**
   * Search questions
   */
  searchQuestions: async (searchTerm: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Question>>> => {
    return qnaAPI.searchQuestions(searchTerm, params);
  }
};

export default qnaService; 