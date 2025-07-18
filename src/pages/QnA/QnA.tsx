import React, { useState, useEffect } from 'react';
import './QnA.css';
import { qnaService } from '../../services';
import authService from '../../services/authService';
import type { 
  CreateQuestionRequest, 
  CreateAnswerRequest
} from '../../types';
import { STORAGE_KEYS, ROUTES } from '../../config/constants';

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
}

const QnA = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState<CreateQuestionRequest>({
    content: '',
  });

  // Add state for loading, error, and questions data
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Fetch questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Function to fetch questions from API
  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await qnaService.getAllQuestions({ 
        page: 1,
        limit: 50 
      });
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
        
        setQuestions(mappedQuestions);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      
      // Check if error is "No questions" which means there are just no questions yet
      if (err instanceof Error && err.message === 'No questions') {
        // Treat as empty state, not an error
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
      const response = await qnaService.getQuestion(questionId);
      if (response && response.data) {
        const q = response.data;
        const question: Question = {
          id: q.questionID || q.id,
          content: q.content || '',
          date: new Date(q.createdAt || new Date()).toISOString().split('T')[0],
          author: (q.customer && q.customer.name) || q.authorName || 'Ẩn danh',
          authorRole: q.authorRole || 'user',
          answered: q.messages && q.messages.length > 0 || false,
          answers: (q.messages || []).map((a) => ({
            id: a.messageID || a.id,
            content: a.content || '',
            author: (a.customer && a.customer.name) || a.authorName || 'Ẩn danh',
            authorRole: a.authorRole || 'user',
            date: new Date(a.createdAt || new Date()).toISOString().split('T')[0],
            isVerified: a.isVerified || false
          }))
        };
        setSelectedQuestion(question);
      }
    } catch (err) {
      console.error('Error fetching question details:', err);
      setError('Không thể tải chi tiết câu hỏi. Vui lòng thử lại sau.');
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
    setSelectedQuestion(null);
  };

  // Handle ask button
  const handleAskButton = () => {
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
    
    // Check if user is logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    
    if (!token || !isLoggedIn) {
      setError(null);
      setIsLoading(false);
      setShowLoginModal(true);
      return;
    }
    
    try {
      const response = await qnaService.createQuestion(newQuestion);
      if (response && response.data) {
        alert("Câu hỏi của bạn đã được gửi và đang chờ được duyệt.");
        setShowAskModal(false);
        setNewQuestion({
          content: ''
        });
        // Refresh questions
        fetchQuestions();
      }
    } catch (err) {
      console.error('Error submitting question:', err);
      
      // Check for 403 Forbidden error
      if (err instanceof Error && err.message.includes('403')) {
        setError('Bạn không có quyền đặt câu hỏi. Vui lòng đăng nhập hoặc liên hệ quản trị viên.');
        
        // Clear token if it's invalid and redirect to login
        authService.clearAuthData();
        
        setTimeout(() => {
          window.location.href = ROUTES.AUTH.LOGIN;
        }, 2000);
      } else {
        setError('Không thể gửi câu hỏi. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit an answer to a question
  const handleSubmitAnswer = async (questionId: number, content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Check if user is logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    
    if (!token || !isLoggedIn) {
      setError(null);
      setIsLoading(false);
      setShowLoginModal(true);
      return;
    }
    
    try {
      const answerData: CreateAnswerRequest = {
        questionId,
        content
      };
      
      const response = await qnaService.addMessage(questionId, answerData);
      if (response && response.data) {
        // Fetch updated question details to show the new answer
        fetchQuestionDetail(questionId);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      
      // Check for 403 Forbidden error
      if (err instanceof Error && err.message.includes('403')) {
        setError('Bạn không có quyền trả lời câu hỏi. Vui lòng đăng nhập hoặc liên hệ quản trị viên.');
        
        // Clear token if it's invalid and redirect to login
        authService.clearAuthData();
        
        setTimeout(() => {
          window.location.href = ROUTES.AUTH.LOGIN;
        }, 2000);
      } else {
        setError('Không thể gửi câu trả lời. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Main container */}
      <div className="qna-content">
        {/* Header */}
      <div className="qna-header">
          <h1>Hỏi & Đáp về sức khỏe</h1>
          <p>Đặt câu hỏi và nhận câu trả lời từ các chuyên gia y tế của chúng tôi</p>
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
          <button className="ask-button" onClick={handleAskButton}>
            Đặt câu hỏi
          </button>
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
                    </div>
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
                  handleSubmitAnswer(selectedQuestion.id || 0, content);
                  contentElement.value = '';
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
              <p className="login-benefits">Đăng nhập giúp bạn theo dõi câu hỏi của mình, nhận thông báo khi có câu trả lời và tích lũy uy tín trong cộng đồng.</p>
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
    </div>
  );
};

export default QnA; 