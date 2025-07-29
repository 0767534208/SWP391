import React, { useState, useEffect, useRef } from 'react';
import './QnA.css';
import './reply-styles.css';
import './realtime.css';
import './confirm-modal.css';
import './toast-notification.css';
import { qnaService, qnaSignalRService } from '../../services';
import authService from '../../services/authService';
import { authUtils } from '../../utils/auth';
import type { 
  CreateQuestionRequest, 
  CreateAnswerRequest
} from '../../types';
import { STORAGE_KEYS, ROUTES, USER_ROLES } from '../../config/constants';

// Map the API Question and Answer types to the local component state types
interface Question {
  id: number | undefined;
  content: string;
  date: string;
  author: string;
  authorRole: string;
  answered: boolean;
  answers: Answer[];
}

interface Answer {
  id: number | undefined;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  isVerified: boolean;
  parentMessageId: number | null;
  replies: Answer[];
}

// Define the type for our toast notifications
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const QnA = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<{questionId: number, content: string, parentMessageId?: number | null}>({questionId: 0, content: ''});
  const [newQuestion, setNewQuestion] = useState<CreateQuestionRequest>({
    content: '',
  });
  
  // Add toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add state for loading, error, questions data, and real-time connection status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState<boolean>(false);
  
  // Function to show a toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Automatically remove the toast after 4 seconds (to match CSS animation)
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };
  
  // Function to manually remove a toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // Check if user can ask questions (only normal users can ask questions)
  const canAskQuestions = () => {
    // Staff and consultants cannot ask questions
    const restrictedRoles = [USER_ROLES.STAFF, USER_ROLES.CONSULTANT];
    const userRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    
    if (!userRole) return true; // If no role is set (not logged in), show the ask button
    
    // Return true if the user is NOT a staff or consultant
    return !restrictedRoles.includes(userRole.toLowerCase());
  };
  
  // Initialize SignalR connection and fetch questions on component mount
  useEffect(() => {
    fetchQuestions();
    
    // Initialize SignalR connection
    const initializeSignalR = async () => {
      try {
        // Get the API base URL from the current origin
        const apiBaseUrl = window.location.origin;
        console.log('Initializing SignalR connection to:', apiBaseUrl);
        
        // Start the SignalR connection
        const connected = await qnaSignalRService.startConnection(apiBaseUrl);
        
        if (connected) {
          setIsRealTimeConnected(true);
          
          // Set up event handlers for real-time updates
          qnaSignalRService.onMessageReceived((questionId, message) => {
            console.log('Real-time message received:', message, 'for question:', questionId);
            
            // If we're viewing this question, update it
            if (selectedQuestion && selectedQuestion.id === questionId) {
              fetchQuestionDetail(questionId);
            } else {
              // Otherwise, just refresh the questions list
              fetchQuestions();
            }
          });
          
          // Handle connection errors
          qnaSignalRService.onConnectionError(() => {
            setIsRealTimeConnected(false);
          });
        }
      } catch (error) {
        console.error('Failed to initialize SignalR:', error);
      }
    };
    
    initializeSignalR();
    
    // Clean up SignalR connection on component unmount
    return () => {
      qnaSignalRService.stopConnection();
    };
  }, []);

  // Function to fetch questions from API
  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching all questions...");
      const response = await qnaService.getAllQuestions({ 
        page: 1,
        limit: 50 
      });
      console.log("Questions API response:", response);
      
      if (response && response.data) {
        // Check if data is an array (direct response) or has items property (paginated response)
        const questionItems = Array.isArray(response.data) ? response.data : 
                             (response.data.items ? response.data.items : []);
        
        // Map API response to component state format
        const mappedQuestions = questionItems.map((q) => ({
          id: q.questionID || q.id,
          content: q.content || '',
          date: new Date(q.createdAt || new Date()).toISOString().split('T')[0],
          author: (q.customer && q.customer.name) || q.authorName || 'Ẩn danh',
          authorRole: q.authorRole || 'user',
          answered: q.messages && q.messages.length > 0 || false,
          answers: [] // Answers will be fetched separately when a question is selected
        })) as Question[];
        
        console.log("Mapped questions:", mappedQuestions);
        setQuestions(mappedQuestions);
      } else {
        console.warn("No data returned from questions API");
        setQuestions([]);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      
      // Check if error is "No questions" which means there are just no questions yet
      if (err instanceof Error && err.message === 'No questions') {
        // Treat as empty state, not an error
        console.log("No questions found - empty state");
        setQuestions([]);
      } else {
        // Other errors
        setError('Không thể tải câu hỏi. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch a single question with answers
  const fetchQuestionDetail = async (questionId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching question detail for ID ${questionId}...`);
      const response = await qnaService.getQuestion(questionId);
      console.log("Question detail API response:", response);
      
      if (response && response.data) {
        const q = response.data;
        
        // First, map all messages to Answer objects
        const allMessages = (q.messages || []).map((a: any): Answer => ({
          id: a.messageID || a.id,
          content: a.content || '',
          author: (a.customer && a.customer.name) || a.authorName || 'Ẩn danh',
          authorRole: a.authorRole || 'user',
          date: new Date(a.createdAt || new Date()).toISOString().split('T')[0],
          isVerified: a.isVerified || false,
          parentMessageId: a.parentMessageId || null,
          replies: []
        }));
        
        // Create a message lookup for faster access
        const messagesById: { [id: number]: Answer } = {};
        allMessages.forEach(message => {
          if (message.id) {
            messagesById[message.id] = message;
          }
        });
        
        // Build the reply hierarchy recursively
        // This approach allows for unlimited levels of nesting
        const topLevelAnswers: Answer[] = [];
          
        allMessages.forEach(message => {
          if (message.parentMessageId) {
            // This is a reply to another message
            const parent = messagesById[message.parentMessageId];
            if (parent) {
              if (!parent.replies) {
                parent.replies = [];
              }
              parent.replies.push(message);
            }
          } else {
            // This is a top-level message (direct answer to the question)
            topLevelAnswers.push(message);
          }
        });
        
        const question: Question = {
          id: q.questionID || q.id,
          content: q.content || '',
          date: new Date(q.createdAt || new Date()).toISOString().split('T')[0],
          author: (q.customer && q.customer.name) || q.authorName || 'Ẩn danh',
          authorRole: q.authorRole || 'user',
          answered: q.messages && q.messages.length > 0 || false,
          answers: topLevelAnswers
        };
        console.log("Mapped question detail:", question);
        setSelectedQuestion(question);
        
        // Join the SignalR group for this question to receive real-time updates
        if (question.id) {
          qnaSignalRService.joinQuestionRoom(question.id);
        }
      } else {
        console.warn(`No data returned for question ID ${questionId}`);
        setError('Không thể tìm thấy câu hỏi này.');
      }
    } catch (err) {
      console.error('Error fetching question details:', err);
      setError('Không thể tải chi tiết câu hỏi. Vui lòng thử lại sau.');
      
      // Add a timeout to return to the questions list
      setTimeout(() => {
        closeQuestion();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = 
      question.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'answered' && question.answered) ||
      (filterStatus === 'unanswered' && !question.answered);
    
    return matchesSearch && matchesStatus;
  });
  
  // Open question detail
  const openQuestion = (question: Question) => {
    fetchQuestionDetail(question.id || 0); // Ensure question.id is not undefined
  };
  
  // Close question detail
  const closeQuestion = () => {
    // Leave the SignalR group when closing a question
    if (selectedQuestion && selectedQuestion.id) {
      qnaSignalRService.leaveQuestionRoom(selectedQuestion.id);
    }
    
    setSelectedQuestion(null);
  };

  // Handle ask button
  const handleAskButton = () => {
    // Only allow regular users to ask questions
    if (!canAskQuestions()) {
      const errorMessage = 'Chỉ người dùng thông thường mới có thể đặt câu hỏi.';
      showToast(errorMessage, "error");
      setError(errorMessage);
      return;
    }
    setShowAskModal(true);
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewQuestion({
      ...newQuestion,
      [name]: value
    });
  };

  // Handle form submit - Create a new question
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validate question content
    if (!newQuestion.content.trim() || newQuestion.content.trim().length < 10) {
      const errorMessage = 'Câu hỏi phải có ít nhất 10 ký tự.';
      showToast(errorMessage, "error");
      setError(errorMessage);
      setIsLoading(false);
      return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    
    if (!token || !isLoggedIn) {
      setError(null);
      setIsLoading(false);
      setShowLoginModal(true);
      return;
    }
    
    // Check if user has permission to ask questions (only regular users can)
    if (!canAskQuestions()) {
      setError('Tư vấn viên và nhân viên không thể đặt câu hỏi.');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Creating new question:", newQuestion);
      const response = await qnaService.createQuestion(newQuestion);
      console.log("Create question API response:", response);
      
      if (response && response.data) {
        showToast("✅ Câu hỏi của bạn đã được gửi và đang chờ được duyệt!", "success");
        setShowAskModal(false);
        setNewQuestion({
          content: ''
        });
        // Refresh questions
        fetchQuestions();
      } else {
        console.warn("No data returned from create question API");
        showToast('❌ Có lỗi xảy ra khi gửi câu hỏi. Vui lòng thử lại sau.', "error");
        setError('Có lỗi xảy ra khi gửi câu hỏi. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Error submitting question:', err);
      
      // Check for 403 Forbidden error
      if (err instanceof Error && err.message.includes('403')) {
        const errorMessage = 'Bạn không có quyền đặt câu hỏi. Vui lòng đăng nhập hoặc liên hệ quản trị viên.';
        showToast(errorMessage, "error");
        setError(errorMessage);
        
        // Clear token if it's invalid and redirect to login
        authService.clearAuthData();
        
        setTimeout(() => {
          window.location.href = ROUTES.AUTH.LOGIN;
        }, 2000);
      } else {
        const errorMessage = 'Không thể gửi câu hỏi. Vui lòng thử lại sau.';
        showToast(errorMessage, "error");
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to show confirmation modal and store the pending answer
  const confirmSubmitAnswer = (questionId: number, content: string, parentMessageId?: number | null) => {
    console.log('Preparing to submit answer:', {
      questionId,
      content,
      parentMessageId
    });
    
    if (!content.trim()) {
      console.error('Empty content provided');
      const errorMessage = 'Vui lòng nhập nội dung câu trả lời.';
      showToast(errorMessage, "error");
      setError(errorMessage);
      return;
    }
    
    if (content.trim().length < 5) {
      console.error('Content too short:', content);
      const errorMessage = 'Câu trả lời quá ngắn. Vui lòng cung cấp câu trả lời chi tiết hơn.';
      showToast(errorMessage, "error");
      setError(errorMessage);
      return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    
    if (!token || !isLoggedIn) {
      console.error('User not logged in');
      setError(null);
      setShowLoginModal(true);
      return;
    }
    
    // Store the pending answer and show confirmation modal
    setPendingAnswer({ questionId, content, parentMessageId });
    setShowConfirmModal(true);
  };

  // Submit an answer to a question
  const handleSubmitAnswer = async (questionId: number, content: string, parentMessageId?: number | null) => {
    console.log('handleSubmitAnswer called with:', {
      questionId,
      content,
      parentMessageId,
      isParentMessageIdDefined: parentMessageId !== undefined && parentMessageId !== null,
    });
    
    setIsLoading(true);
    setError(null);
    setShowConfirmModal(false); // Hide modal
    
    // Check if user is logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    const userRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    console.log('Authentication status:', { token: !!token, isLoggedIn, userRole });
    
    if (!token || !isLoggedIn) {
      console.error('User not logged in');
      setError(null);
      setIsLoading(false);
      setShowLoginModal(true);
      return;
    }
    
    // At this point, the user is logged in, and we allow all authenticated users
    // (including consultants and staff) to answer questions
    
    try {
      console.log(`Submitting answer for question ID ${questionId}${parentMessageId ? ` with parent message ID ${parentMessageId}` : ''}`);
      // Convert parentMessageId to number if it's a string
      let processedParentId = parentMessageId;
      if (typeof parentMessageId === 'string') {
        processedParentId = parseInt(parentMessageId, 10);
        console.log(`Converted parentMessageId from string to number: ${parentMessageId} -> ${processedParentId}`);
      }
      
      const answerData: CreateAnswerRequest = {
        questionId,
        content,
        parentMessageId: processedParentId
      };
      console.log("Answer data being sent to API:", JSON.stringify(answerData));
      
      try {
        const response = await qnaService.addMessage(questionId, answerData);
        console.log("Submit answer API response:", JSON.stringify(response));
        
        if (response && response.data) {
          console.log("✅ Answer submitted successfully:", JSON.stringify(response.data));
          showToast("✅ Câu trả lời của bạn đã được gửi thành công !", "success");
          
          // Add a small delay before fetching the updated question to ensure the API has processed the new reply
          setTimeout(() => {
            fetchQuestionDetail(questionId);
          }, 500);
        } else {
          console.warn("⚠️ No data returned from add message API");
          showToast("Có lỗi xảy ra khi gửi câu trả lời. Vui lòng thử lại sau.", "error");
          setError('Có lỗi xảy ra khi gửi câu trả lời. Vui lòng thử lại sau.');
        }
      } catch (apiError) {
        console.error('❌ API error when submitting answer:', apiError);
        throw apiError; // Re-throw to be caught by the outer catch block
      }
    } catch (err) {
      console.error('❌ Error submitting answer:', err);
      
      // Check for 403 Forbidden error
      if (err instanceof Error && err.message.includes('403')) {
        const errorMessage = 'Bạn không có quyền trả lời câu hỏi. Vui lòng đăng nhập hoặc liên hệ quản trị viên.';
        showToast(errorMessage, "error");
        setError(errorMessage);
        
        // Clear token if it's invalid and redirect to login
        authService.clearAuthData();
        
        setTimeout(() => {
          window.location.href = ROUTES.AUTH.LOGIN;
        }, 2000);
      } else {
        const errorMessage = 'Không thể gửi câu trả lời. Vui lòng thử lại sau.';
        showToast(errorMessage, "error");
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // State for reply functionality
  const [replyingTo, setReplyingTo] = useState<Answer | null>(null);
  
  // Debug log when replyingTo changes
  useEffect(() => {
    console.log('replyingTo state changed:', replyingTo);
  }, [replyingTo]);
  
  // Effect to handle SignalR room subscription when selected question changes
  useEffect(() => {
    // If a question is selected and it has an ID, join that room
    if (selectedQuestion && selectedQuestion.id) {
      qnaSignalRService.joinQuestionRoom(selectedQuestion.id);
    }
    
    // Clean up when component unmounts or question changes
    return () => {
      if (selectedQuestion && selectedQuestion.id) {
        qnaSignalRService.leaveQuestionRoom(selectedQuestion.id);
      }
    };
  }, [selectedQuestion?.id]);

  // Handle searching questions
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchQuestions();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await qnaService.searchQuestions(searchQuery);
      if (response && response.data) {
        // Map API response to component state format
        const mappedQuestions = response.data.items.map((q) => ({
          id: q.questionID || q.id,
          content: q.content || '',
          date: new Date(q.createdAt || new Date()).toISOString().split('T')[0],
          author: (q.customer && q.customer.name) || q.authorName || 'Ẩn danh',
          authorRole: q.authorRole || 'user',
          answered: q.messages && q.messages.length > 0 || false,
          answers: [] // Answers will be fetched separately when a question is selected
        })) as Question[];
        
        setQuestions(mappedQuestions);
      }
    } catch (err) {
      console.error('Error searching questions:', err);
      setError('Không thể tìm kiếm câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="qna-container">
      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-content">
              <div className="toast-icon">
                {toast.type === 'success' && <i className="fas fa-check-circle"></i>}
                {toast.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
                {toast.type === 'info' && <i className="fas fa-info-circle"></i>}
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button 
              className="toast-close"
              onClick={() => removeToast(toast.id)}
            >
              &times;
            </button>
            <div className="toast-progress"></div>
          </div>
        ))}
      </div>
      
      {/* Main container */}
      <div className="qna-content">
        {/* Header */}
      <div className="qna-header">
          <div className="flex justify-between items-center">
            <h1>Hỏi & Đáp về sức khỏe</h1>
            {isRealTimeConnected && (
              <div className="real-time-indicator flex items-center text-sm text-green-600">
                <span className="pulse-dot mr-1"></span>
                <span>Cập nhật trực tuyến</span>
              </div>
            )}
          </div>
          {canAskQuestions() ? (
            <p>Đặt câu hỏi và nhận câu trả lời từ các chuyên gia y tế của chúng tôi</p>
          ) : (
            <p>Trả lời các câu hỏi sức khỏe từ người dùng</p>
          )}
      </div>

        {/* Search and filters */}
        <div className="qna-filters">
          <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
        </div>
          <div className="filter-options">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
              <option value="all">Tất cả trạng thái</option>
              <option value="answered">Đã có câu trả lời</option>
              <option value="unanswered">Chưa có câu trả lời</option>
          </select>
          </div>
          {canAskQuestions() && (
            <button className="ask-button" onClick={handleAskButton}>
              Đặt câu hỏi
            </button>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Đang tải...</p>
      </div>
        )}
        
        {/* Question list */}
        {!isLoading && !selectedQuestion && (
          <div className="question-list">
            <h2>Các câu hỏi gần đây</h2>
            
            {filteredQuestions.length === 0 ? (
              <div className="no-questions">
                <p>Không tìm thấy câu hỏi nào phù hợp với bộ lọc của bạn.</p>
              </div>
            ) : (
          filteredQuestions.map((question) => (
                <div 
                  key={question.id} 
                  className={`question-card ${question.answered ? 'answered' : ''}`}
                  onClick={() => openQuestion(question)}
                >
                  <div className="question-header">
                    <span className="date">{question.date}</span>
              </div>
                  <p className="question-preview">
                  {question.content.length > 150 
                    ? `${question.content.substring(0, 150)}...` 
                      : question.content
                    }
                  </p>
                  <div className="question-footer">
                    <span className="author">Bởi: {question.author}</span>
                    <div className="question-stats">
                      <span className="answer-count">
                        <i className="fas fa-comment"></i>
                        {question.answered ? 'Đã có câu trả lời' : 'Chưa có câu trả lời'}
                  </span>
                </div>
              </div>
            </div>
          ))
            )}
          </div>
        )}
        
        {/* Question detail */}
        {!isLoading && selectedQuestion && (
          <div className="question-detail">
            <button className="back-button" onClick={closeQuestion}>
              <i className="fas fa-arrow-left"></i> Quay lại
            </button>
            
            <div className="question-detail-card">
              <div className="question-header">
                <span className="date">{selectedQuestion.date}</span>
              </div>
              <p className="question-content">{selectedQuestion.content}</p>
              <div className="question-footer">
                <span className="author">Bởi: {selectedQuestion.author}</span>
              </div>
            </div>
            
            <div className="answers-section">
              <h3>Câu trả lời ({selectedQuestion.answers.length})</h3>
              
              {selectedQuestion.answers.length === 0 ? (
                <div className="no-answers-message">
                  Chưa có câu trả lời nào cho câu hỏi này.
                </div>
              ) : (
                selectedQuestion.answers.map((answer) => (
                  <div key={answer.id} className={`answer-card ${answer.isVerified ? 'verified' : ''} ${answer.authorRole !== 'user' ? 'expert-answer' : 'user-answer'}`}>
                    {answer.authorRole !== 'user' && (
                      <div className="expert-badge">
                        <i className="fas fa-user-md"></i> Câu trả lời từ chuyên gia
                      </div>
                    )}
                    <p className="answer-content">{answer.content}</p>
                    <div className="answer-footer">
                      <div className="author-info">
                        <span className="author">
                          {answer.author}
                          {answer.authorRole !== 'user' && (
                            <span className={`role-badge ${answer.authorRole}`}>
                              {answer.authorRole === 'consultant' ? (
                                <><i className="fas fa-stethoscope"></i> Tư vấn viên</>
                              ) : answer.authorRole === 'staff' ? (
                                <><i className="fas fa-user-nurse"></i> Nhân viên</>
                              ) : answer.authorRole === 'admin' ? (
                                <><i className="fas fa-user-shield"></i> Quản trị viên</>
                              ) : (
                                <><i className="fas fa-user-md"></i> Chuyên gia</>
                              )}
                            </span>
                          )}
                          {answer.authorRole === 'user' && (
                            <span className="role-badge">
                              <i className="fas fa-user"></i> Người dùng
                            </span>
                          )}
                        </span>
                        <span className="date">{answer.date}</span>
                        {answer.isVerified && (
                          <span className="verified-badge">
                            <i className="fas fa-check-circle"></i> Đã xác thực
                          </span>
                        )}
                      </div>
                      <div className="answer-actions">
                        <button 
                          className="reply-button"
                          onClick={() => setReplyingTo(answer)}
                        >
                          <i className="fas fa-reply"></i> Trả lời
                        </button>
                      </div>
                    </div>
                    
                    {/* Reply form for this specific answer */}
                    {replyingTo && replyingTo.id === answer.id && (
                      <div className="reply-form">
                        <textarea 
                          id={`reply-content-${answer.id}`}
                          placeholder="Viết câu trả lời của bạn..."
                        />
                        <div className="reply-actions">
                          <button 
                            className="cancel-button"
                            onClick={() => setReplyingTo(null)}
                          >
                            Hủy
                          </button>
                          <button 
                            className="submit-button"
                            onClick={() => {
                              const contentElement = document.getElementById(`reply-content-${answer.id}`) as HTMLTextAreaElement;
                              const content = contentElement.value;
                              if (answer.id) {
                                confirmSubmitAnswer(selectedQuestion.id || 0, content, answer.id);
                                // We'll clear this after confirmation
                              }
                            }}
                          >
                            <i className="fas fa-paper-plane"></i> Gửi
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Display replies to this answer if any */}
                    {answer.replies && answer.replies.length > 0 && (
                      <div className="replies-container">
                        {answer.replies.map(reply => (
                          <div key={reply.id} className={`reply-card ${reply.isVerified ? 'verified' : ''} ${reply.authorRole !== 'user' ? 'expert-reply' : 'user-reply'}`}>
                            <p className="reply-content">{reply.content}</p>
                            <div className="reply-footer">
                              <div className="author-info">
                                <span className="author">
                                  {reply.author}
                                  {reply.authorRole !== 'user' && (
                                    <span className={`role-badge ${reply.authorRole}`}>
                                      {reply.authorRole === 'consultant' ? (
                                        <><i className="fas fa-stethoscope"></i> Tư vấn viên</>
                                      ) : reply.authorRole === 'staff' ? (
                                        <><i className="fas fa-user-nurse"></i> Nhân viên</>
                                      ) : reply.authorRole === 'admin' ? (
                                        <><i className="fas fa-user-shield"></i> Quản trị viên</>
                                      ) : (
                                        <><i className="fas fa-user-md"></i> Chuyên gia</>
                                      )}
                                    </span>
                                  )}
                                  {reply.authorRole === 'user' && (
                                    <span className="role-badge">
                                      <i className="fas fa-user"></i> Người dùng
                                    </span>
                                  )}
                                </span>
                                <span className="date">{reply.date}</span>
                              </div>
                              <div className="answer-actions">
                                <button 
                                  className="reply-button"
                                  onClick={() => setReplyingTo(reply)}
                                >
                                  <i className="fas fa-reply"></i> Trả lời
                                </button>
                              </div>
                            </div>
                            
                            {/* Reply form for this specific reply */}
                            {replyingTo && replyingTo.id === reply.id && (
                              <div className="reply-form">
                                <textarea 
                                  id={`reply-content-${reply.id}`}
                                  placeholder="Viết câu trả lời của bạn..."
                                />
                                <div className="reply-actions">
                                  <button 
                                    className="cancel-button"
                                    onClick={() => setReplyingTo(null)}
                                  >
                                    Hủy
                                  </button>
                                  <button 
                                    className="submit-button"
                                    onClick={() => {
                                      const contentElement = document.getElementById(`reply-content-${reply.id}`) as HTMLTextAreaElement;
                                      const content = contentElement.value;
                                      if (reply.id) {
                                        confirmSubmitAnswer(selectedQuestion.id || 0, content, reply.id);
                                        // We'll clear this after confirmation
                                      }
                                    }}
                                  >
                                    <i className="fas fa-paper-plane"></i> Gửi
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {/* Display nested replies */}
                            {reply.replies && reply.replies.length > 0 && (
                              <div className="replies-container nested-replies">
                                {reply.replies.map(nestedReply => (
                                  <div key={nestedReply.id} className={`reply-card nested ${nestedReply.isVerified ? 'verified' : ''} ${nestedReply.authorRole !== 'user' ? 'expert-reply' : 'user-reply'}`}>
                                    <p className="reply-content">{nestedReply.content}</p>
                                    <div className="reply-footer">
                                      <div className="author-info">
                                        <span className="author">
                                          {nestedReply.author}
                                          {nestedReply.authorRole !== 'user' && (
                                            <span className={`role-badge ${nestedReply.authorRole}`}>
                                              {nestedReply.authorRole === 'consultant' ? (
                                                <><i className="fas fa-stethoscope"></i> Tư vấn viên</>
                                              ) : nestedReply.authorRole === 'staff' ? (
                                                <><i className="fas fa-user-nurse"></i> Nhân viên</>
                                              ) : nestedReply.authorRole === 'admin' ? (
                                                <><i className="fas fa-user-shield"></i> Quản trị viên</>
                                              ) : (
                                                <><i className="fas fa-user-md"></i> Chuyên gia</>
                                              )}
                                            </span>
                                          )}
                                          {nestedReply.authorRole === 'user' && (
                                            <span className="role-badge">
                                              <i className="fas fa-user"></i> Người dùng
                                            </span>
                                          )}
                                        </span>
                                        <span className="date">{nestedReply.date}</span>
                                      </div>
                                      <div className="answer-actions">
                                        <button 
                                          className="reply-button"
                                          onClick={() => {
                                            console.log('Clicking reply button for nested reply:', nestedReply);
                                            setReplyingTo(nestedReply);
                                          }}
                                        >
                                          <i className="fas fa-reply"></i> Trả lời
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Reply form for this specific nested reply */}
                                    {replyingTo && replyingTo.id === nestedReply.id && (
                                      <div className="reply-form">
                                        <textarea 
                                          id={`reply-content-${nestedReply.id}`}
                                          placeholder="Viết câu trả lời của bạn..."
                                        />
                                        <div className="reply-actions">
                                          <button 
                                            className="cancel-button"
                                            onClick={() => setReplyingTo(null)}
                                          >
                                            Hủy
                                          </button>
                                          <button 
                                            className="submit-button"
                                            onClick={() => {
                                              const contentElement = document.getElementById(`reply-content-${nestedReply.id}`) as HTMLTextAreaElement;
                                              const content = contentElement.value;
                                              console.log('Submitting nested reply:', {
                                                questionId: selectedQuestion.id,
                                                content,
                                                parentMessageId: nestedReply.id,
                                                replyingTo: nestedReply
                                              });
                                              if (nestedReply.id) {
                                                confirmSubmitAnswer(selectedQuestion.id || 0, content, nestedReply.id);
                                                // We'll clear this after confirmation
                                              } else {
                                                console.error('Cannot reply: nestedReply.id is undefined', nestedReply);
                                              }
                                            }}
                                          >
                                            <i className="fas fa-paper-plane"></i> Gửi
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {/* Add answer form */}
              <div className="add-answer">
                <h4><i className="fas fa-reply"></i> Trả lời câu hỏi này</h4>
                <textarea 
                  id="answer-content"
                  placeholder="Viết câu trả lời của bạn ở đây... Cố gắng cung cấp thông tin đầy đủ và chính xác nhất có thể."
                />
                <div className="answer-note">
                  <i className="fas fa-info-circle"></i> Câu trả lời của bạn sẽ được hiển thị công khai.
                </div>
                <button onClick={() => {
                  const contentElement = document.getElementById('answer-content') as HTMLTextAreaElement;
                  const content = contentElement.value;
                  confirmSubmitAnswer(selectedQuestion.id || 0, content, null);
                  // We'll clear this after confirmation
                }}>
                  <i className="fas fa-paper-plane"></i> Gửi câu trả lời
                </button>
                </div>
            </div>
          </div>
        )}
        </div>
      
      {/* Ask question modal */}
      {showAskModal && (
        <div className="modal-overlay">
          <div className="ask-modal">
            <div className="modal-header">
              <h3>Đặt câu hỏi</h3>
              <button className="close-button" onClick={() => setShowAskModal(false)}>
                &times;
            </button>
            </div>
            <form onSubmit={handleFormSubmit} className="question-form">
              <div className="form-group">
                <label htmlFor="content">Nội dung câu hỏi</label>
                <textarea 
                  id="content"
                  name="content" 
                  value={newQuestion.content} 
                  onChange={handleFormChange} 
                  placeholder="Mô tả chi tiết câu hỏi của bạn. Cung cấp càng nhiều thông tin sẽ giúp chuyên gia có thể trả lời chính xác hơn." 
                  required 
                />
              </div>
              <div className="form-note">
                <i className="fas fa-info-circle"></i> Câu hỏi của bạn sẽ được hiển thị công khai. Chúng tôi khuyến khích không sử dụng thông tin cá nhân có thể nhận dạng được.
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowAskModal(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Đang gửi...</> : <><i className="fas fa-paper-plane"></i> Gửi câu hỏi</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="login-modal">
            <div className="modal-header">
              <h3><i className="fas fa-lock"></i> Yêu cầu đăng nhập</h3>
              <button className="close-button" onClick={() => setShowLoginModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-content">
              <div className="login-icon">
                <i className="fas fa-user-circle"></i>
              </div>
              <p>Bạn cần đăng nhập để sử dụng tính năng này.</p>
              <p className="login-benefits">
                Đăng nhập giúp bạn {canAskQuestions() ? 'theo dõi câu hỏi của mình, nhận thông báo khi có câu trả lời' : 'trả lời câu hỏi của người dùng'} và tích lũy uy tín trong cộng đồng.
              </p>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowLoginModal(false)}
                >
                  <i className="fas fa-times"></i> Đóng
                </button>
                <button 
                  type="button" 
                  className="submit-button"
                  onClick={() => window.location.href = ROUTES.AUTH.LOGIN}
                >
                  <i className="fas fa-sign-in-alt"></i> Đăng nhập ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {showConfirmModal && pendingAnswer && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <h3><i className="fas fa-question-circle"></i> Xác nhận gửi câu trả lời</h3>
              <button className="close-button" onClick={() => setShowConfirmModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-content">
              <div className="confirm-icon">
                <i className="fas fa-paper-plane"></i>
              </div>
              <p>Bạn có chắc chắn muốn gửi câu trả lời này không?</p>
              <div className="answer-preview">
                <p>{pendingAnswer.content}</p>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowConfirmModal(false)}
                >
                  <i className="fas fa-times"></i> Hủy
                </button>
                <button 
                  type="button" 
                  className="submit-button"
                  onClick={() => {
                    // Submit the answer
                    handleSubmitAnswer(
                      pendingAnswer.questionId, 
                      pendingAnswer.content, 
                      pendingAnswer.parentMessageId
                    );
                    
                    // Clear form if there was a reply in progress
                    if (replyingTo && replyingTo.id) {
                      const contentElement = document.getElementById(`reply-content-${replyingTo.id}`) as HTMLTextAreaElement;
                      if (contentElement) contentElement.value = '';
                    } else {
                      // Clear the main answer textarea
                      const contentElement = document.getElementById('answer-content') as HTMLTextAreaElement;
                      if (contentElement) contentElement.value = '';
                    }
                    
                    // Reset replyingTo state
                    setReplyingTo(null);
                  }}
                >
                  <i className="fas fa-paper-plane"></i> Gửi ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QnA; 