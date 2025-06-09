import React, { useState } from 'react';
import './QnA.css';

interface Question {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
  author: string;
  authorRole: string;
  votes: number;
  answered: boolean;
  answers: Answer[];
}

interface Answer {
  id: number;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  isVerified: boolean;
  votes: number;
}

const QnA = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    category: 'Sức khỏe tình dục',
  });
  
  // Add state to track liked/disliked content
  const [userVotes, setUserVotes] = useState<{
    questions: { [id: number]: 'up' | 'down' | null },
    answers: { [id: number]: 'up' | 'down' | null }
  }>({
    questions: {},
    answers: {}
  });

  // Mock data for questions
  const questions: Question[] = [
    {
      id: 1,
      title: 'Triệu chứng ban đầu của HIV là gì?',
      content: "Tôi lo lắng về việc có thể đã tiếp xúc gần đây. Tôi nên để ý những triệu chứng nào trong giai đoạn đầu của nhiễm HIV?",
      category: 'STI',
      date: '2023-06-10',
      author: 'Ẩn danh',
      authorRole: 'user',
      votes: 24,
      answered: true,
      answers: [
        {
          id: 101,
          content: "Các triệu chứng HIV ban đầu thường xuất hiện 2-4 tuần sau khi nhiễm bệnh và có thể bao gồm sốt, mệt mỏi, đau họng, sưng hạch bạch huyết, phát ban và đau cơ. Những triệu chứng giống cúm này là một phần của giai đoạn được gọi là nhiễm HIV cấp tính. Tuy nhiên, không phải ai cũng gặp các triệu chứng, và cách duy nhất để biết chắc chắn là xét nghiệm. Xét nghiệm HIV có thể phát hiện nhiễm trùng khoảng 10-33 ngày sau khi phơi nhiễm, tùy thuộc vào loại xét nghiệm.",
          author: 'BS. Nguyễn Văn A',
          authorRole: 'consultant',
          date: '2023-06-11',
          isVerified: true,
          votes: 18
        },
        {
          id: 102,
          content: "Tôi muốn nhấn mạnh rằng việc xét nghiệm thường xuyên là rất quan trọng nếu bạn có quan hệ tình dục với nhiều đối tác. Phát hiện sớm dẫn đến điều trị sớm, điều này rất quan trọng để duy trì sức khỏe và giảm lây truyền.",
          author: 'Chuyên gia giáo dục sức khỏe',
          authorRole: 'staff',
          date: '2023-06-12',
          isVerified: true,
          votes: 12
        }
      ]
    },
    {
      id: 2,
      title: 'Thuốc tránh thai uống hiệu quả như thế nào?',
      content: "Tôi đang cân nhắc sử dụng thuốc tránh thai uống. Hiệu quả ngừa thai của nó như thế nào, và những yếu tố nào có thể làm giảm hiệu quả?",
      category: 'Tránh thai',
      date: '2023-06-14',
      author: 'Hoa',
      authorRole: 'user',
      votes: 19,
      answered: true,
      answers: [
        {
          id: 201,
          content: "Khi được uống đúng cách và đều đặn, thuốc tránh thai có hiệu quả khoảng 99% trong việc ngăn ngừa mang thai. Tuy nhiên, trong thực tế (tính đến việc quên uống thuốc và các lỗi khác), hiệu quả khoảng 91%. Các yếu tố có thể làm giảm hiệu quả bao gồm: quên uống thuốc, dùng một số loại thuốc khác (như kháng sinh, thuốc chống co giật và một số thực phẩm bổ sung thảo dược như St. John's Wort), nôn hoặc tiêu chảy, và trong một số trường hợp là thừa cân đáng kể. Luôn sử dụng biện pháp dự phòng nếu bạn quên uống thuốc hoặc có bất kỳ yếu tố nào trên.",
          author: 'BS. Trần Văn B',
          authorRole: 'consultant',
          date: '2023-06-15',
          isVerified: true,
          votes: 22
        }
      ]
    },
    {
      id: 3,
      title: 'Kinh nguyệt không đều có bình thường không?',
      content: 'Chu kỳ kinh nguyệt của tôi đã không đều trong vài tháng qua. Đôi khi tôi bỏ qua một tháng, và những lúc khác nó đến sớm. Đây có phải là điều tôi nên lo lắng không?',
      category: 'Sức khỏe sinh sản',
      date: '2023-06-18',
      author: 'Linh',
      authorRole: 'user',
      votes: 31,
      answered: true,
      answers: [
        {
          id: 301,
          content: 'Kinh nguyệt không đều có thể bình thường tùy thuộc vào độ tuổi, hoàn cảnh cuộc sống và sức khỏe tổng thể của bạn. Các yếu tố như căng thẳng, thay đổi cân nặng đáng kể, tập thể dục quá mức, mất cân bằng nội tiết tố, hội chứng buồng trứng đa nang, vấn đề tuyến giáp và gần đến thời kỳ mãn kinh đều có thể gây ra tình trạng không đều. Mặc dù thỉnh thoảng không đều thường không đáng lo ngại, nhưng tình trạng không đều kéo dài (đặc biệt nếu mới xuất hiện) cần được khám để loại trừ các bệnh lý tiềm ẩn.',
          author: 'BS. Phạm Thị C',
          authorRole: 'consultant',
          date: '2023-06-19',
          isVerified: true,
          votes: 27
        },
        {
          id: 302,
          content: 'Tôi cũng từng gặp vấn đề tương tự và biết rằng nó liên quan đến mức độ căng thẳng và thói quen tập thể dục của tôi. Theo dõi chu kỳ của bạn bằng một ứng dụng có thể giúp bạn nhận thấy các mối liên quan đến các yếu tố lối sống.',
          author: 'Mai',
          authorRole: 'user',
          date: '2023-06-20',
          isVerified: false,
          votes: 15
        }
      ]
    },
    {
      id: 4,
      title: 'Tôi nên xét nghiệm STI thường xuyên như thế nào?',
      content: "Tôi có đời sống tình dục nhưng không chắc nên xét nghiệm STI thường xuyên ra sao. Tần suất được khuyến nghị là gì?",
      category: 'STI',
      date: '2023-06-22',
      author: 'Ẩn danh',
      authorRole: 'user',
      votes: 42,
      answered: true,
      answers: [
        {
          id: 401,
          content: "Tần suất xét nghiệm STI phụ thuộc vào các yếu tố rủi ro của bạn. Theo hướng dẫn chung: (1) Hàng năm nếu bạn có hoạt động tình dục dưới 25 tuổi, (2) Hàng năm nếu trên 25 tuổi với đối tác mới hoặc nhiều đối tác, (3) Mỗi 3-6 tháng nếu bạn có nhiều đối tác hoặc các yếu tố rủi ro cao hơn như quan hệ tình dục không được bảo vệ, (4) Trước khi bắt đầu mối quan hệ với đối tác mới, (5) Ngay lập tức nếu bạn gặp các triệu chứng hoặc biết rằng bạn đã bị phơi nhiễm. Hãy nhớ rằng nhiều STI không biểu hiện triệu chứng, vì vậy việc xét nghiệm thường xuyên là quan trọng bất kể bạn cảm thấy thế nào.",
          author: 'BS. Lê Văn D',
          authorRole: 'consultant',
          date: '2023-06-23',
          isVerified: true,
          votes: 38
        }
      ]
    },
    {
      id: 5,
      title: 'Những loại chất bôi trơn nào an toàn nhất khi sử dụng với bao cao su?',
      content: "Tôi đã nghe nói rằng một số chất bôi trơn có thể làm hỏng bao cao su. Loại nào an toàn để sử dụng cùng nhau?",
      category: 'Sức khỏe tình dục',
      date: '2023-06-28',
      author: 'Minh',
      authorRole: 'user',
      votes: 17,
      answered: false,
      answers: []
    }
  ];

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || question.category === filterCategory;
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'answered' && question.answered) ||
      (filterStatus === 'unanswered' && !question.answered);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(questions.map(q => q.category)))];
  
  // Open question detail
  const openQuestion = (question: Question) => {
    setSelectedQuestion(question);
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

  // Handle form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally submit to backend
    console.log("Submitting question:", newQuestion);
    alert("Câu hỏi của bạn đã được gửi và sẽ được đội ngũ của chúng tôi xem xét.");
    setShowAskModal(false);
    setNewQuestion({
      title: '',
      content: '',
      category: 'Sức khỏe tình dục'
    });
  };

  // Updated vote handling function with like/dislike tracking
  const handleVote = (e: React.MouseEvent, id: number, type: 'question' | 'answer', direction: 'up' | 'down') => {
    e.stopPropagation(); // Prevent opening the question when voting
    
    // Create a copy of the questions array
    const updatedQuestions = [...questions];
    
    // Create a copy of the userVotes state
    const updatedUserVotes = {
      questions: { ...userVotes.questions },
      answers: { ...userVotes.answers }
    };
    
    if (type === 'question') {
      // Find the question to update
      const questionIndex = updatedQuestions.findIndex(q => q.id === id);
      if (questionIndex !== -1) {
        // Get current vote status for this question
        const currentVote = userVotes.questions[id];
        
        // Handle different voting scenarios - but always change by exactly 1 unit
        if (currentVote === direction) {
          // Clicking the same direction again = removing vote
          if (direction === 'up') {
            updatedQuestions[questionIndex].votes -= 1;
          } else if (direction === 'down') {
            updatedQuestions[questionIndex].votes += 1;
          }
          updatedUserVotes.questions[id] = null;
        } else if (currentVote === null || currentVote === undefined) {
          // New vote
          if (direction === 'up') {
            updatedQuestions[questionIndex].votes += 1;
          } else if (direction === 'down') {
            updatedQuestions[questionIndex].votes = Math.max(0, updatedQuestions[questionIndex].votes - 1);
          }
          updatedUserVotes.questions[id] = direction;
        } else {
          // Changing vote from opposite direction - CHANGED to only adjust by 1
          if (direction === 'up') {
            // Changing from down to up (just add 1)
            updatedQuestions[questionIndex].votes += 1;
          } else {
            // Changing from up to down (just subtract 1)
            updatedQuestions[questionIndex].votes = Math.max(0, updatedQuestions[questionIndex].votes - 1);
          }
          updatedUserVotes.questions[id] = direction;
        }
        
        // If we're in the question detail view, update the selected question as well
        if (selectedQuestion && selectedQuestion.id === id) {
          setSelectedQuestion({
            ...selectedQuestion,
            votes: updatedQuestions[questionIndex].votes
          });
        }
      }
    } else if (type === 'answer') {
      // Find the question containing the answer
      if (selectedQuestion) {
        const questionIndex = updatedQuestions.findIndex(q => q.id === selectedQuestion.id);
        if (questionIndex !== -1) {
          // Find the answer to update
          const answerIndex = updatedQuestions[questionIndex].answers.findIndex(a => a.id === id);
          if (answerIndex !== -1) {
            // Get current vote status for this answer
            const currentVote = userVotes.answers[id];
            
            // Handle different voting scenarios - but always change by exactly 1 unit
            if (currentVote === direction) {
              // Clicking the same direction again = removing vote
              if (direction === 'up') {
                updatedQuestions[questionIndex].answers[answerIndex].votes -= 1;
              } else if (direction === 'down') {
                updatedQuestions[questionIndex].answers[answerIndex].votes += 1;
              }
              updatedUserVotes.answers[id] = null;
            } else if (currentVote === null || currentVote === undefined) {
              // New vote
              if (direction === 'up') {
                updatedQuestions[questionIndex].answers[answerIndex].votes += 1;
              } else if (direction === 'down') {
                updatedQuestions[questionIndex].answers[answerIndex].votes = Math.max(0, updatedQuestions[questionIndex].answers[answerIndex].votes - 1);
              }
              updatedUserVotes.answers[id] = direction;
            } else {
              // Changing vote from opposite direction - CHANGED to only adjust by 1
              if (direction === 'up') {
                // Changing from down to up (just add 1)
                updatedQuestions[questionIndex].answers[answerIndex].votes += 1;
              } else {
                // Changing from up to down (just subtract 1)
                updatedQuestions[questionIndex].answers[answerIndex].votes = Math.max(0, updatedQuestions[questionIndex].answers[answerIndex].votes - 1);
              }
              updatedUserVotes.answers[id] = direction;
            }
            
            // Update the selected question's answer as well
            const updatedAnswers = [...selectedQuestion.answers];
            updatedAnswers[answerIndex].votes = updatedQuestions[questionIndex].answers[answerIndex].votes;
            
            setSelectedQuestion({
              ...selectedQuestion,
              answers: updatedAnswers
            });
          }
        }
      }
    }
    
    // Update the userVotes state
    setUserVotes(updatedUserVotes);
    
    // In a real application, you would send this update to the backend
    console.log(`Vote ${direction} for ${type} ${id}`);
  };

  return (
    <div className="qna-container">
      <div className="qna-header">
        <div>
          <h1 className="text-2xl font-bold mb-1">Hỏi & Đáp</h1>
          <p className="text-sm text-gray-500">
            Tìm câu trả lời cho các câu hỏi về sức khỏe sinh sản và tình dục của bạn
          </p>
        </div>
        <button 
          className="ask-question-button" 
          onClick={handleAskButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Đặt câu hỏi
        </button>
      </div>

      {/* Search and Filters */}
      <div className="qna-filter-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="filter-controls">
          <select 
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category === 'all' ? 'Tất cả danh mục' : category}
              </option>
            ))}
          </select>
          
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả câu hỏi</option>
            <option value="answered">Đã trả lời</option>
            <option value="unanswered">Chưa trả lời</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="questions-list">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <div key={question.id} className="question-card" onClick={() => openQuestion(question)}>
              <div className="question-votes">
                <button 
                  className={`vote-button ${userVotes.questions[question.id] === 'up' ? 'active-up' : ''}`}
                  onClick={(e) => handleVote(e, question.id, 'question', 'up')}
                  title="Thích"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                </button>
                <span className="vote-count">{question.votes}</span>
                <button 
                  className={`vote-button ${userVotes.questions[question.id] === 'down' ? 'active-down' : ''}`}
                  onClick={(e) => handleVote(e, question.id, 'question', 'down')}
                  title="Không thích"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H7"></path>
                    <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                  </svg>
                </button>
                <span className="vote-label" style={{display: 'none'}}>bình chọn</span>
              </div>
              
              <div className="question-content">
                <h3 className="question-title">{question.title}</h3>
                <p className="question-excerpt">
                  {question.content.length > 150 
                    ? `${question.content.substring(0, 150)}...` 
                    : question.content}
                </p>
                
                <div className="question-meta">
                  <span className={`question-category category-${question.category.toLowerCase().replace(/\s+/g, '-')}`}>
                    {question.category}
                  </span>
                  <span className={`question-status ${question.answered ? 'answered' : 'unanswered'}`}>
                    {question.answered ? `${question.answers.length} Câu trả lời` : 'Chưa có câu trả lời'}
                  </span>
                  <span className="question-date">
                    Hỏi ngày {new Date(question.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-questions-found">
            <p>Không tìm thấy câu hỏi nào phù hợp với tiêu chí của bạn. Hãy thử điều chỉnh bộ lọc hoặc đặt câu hỏi mới!</p>
            <button 
              className="ask-question-button mt-4" 
              onClick={handleAskButton}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Đặt câu hỏi
            </button>
          </div>
        )}
      </div>
      
      {/* Fixed Ask Question Button */}
      <button 
        className="fixed-ask-button" 
        onClick={handleAskButton}
        aria-label="Đặt câu hỏi"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="question-modal-overlay" onClick={closeQuestion}>
          <div className="question-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeQuestion}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="question-detail-header">
              <h2>{selectedQuestion.title}</h2>
              
              <div className="question-detail-meta">
                <span className={`question-category category-${selectedQuestion.category.toLowerCase().replace(/\s+/g, '-')}`}>
                  {selectedQuestion.category}
                </span>
                <span className="question-date">
                  Hỏi ngày {new Date(selectedQuestion.date).toLocaleDateString()}
                </span>
                <span className="question-author">
                  bởi {selectedQuestion.author}
                </span>
              </div>
            </div>
            
            <div className="question-detail-body">
              <p>{selectedQuestion.content}</p>
              
              <div className="question-votes-actions">
                <div className="vote-buttons">
                  <button 
                    className={`vote-button ${userVotes.questions[selectedQuestion.id] === 'up' ? 'active-up' : ''}`} 
                    onClick={(e) => handleVote(e, selectedQuestion.id, 'question', 'up')}
                    title="Thích"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                  </button>
                  <span>{selectedQuestion.votes}</span>
                  <button 
                    className={`vote-button ${userVotes.questions[selectedQuestion.id] === 'down' ? 'active-down' : ''}`} 
                    onClick={(e) => handleVote(e, selectedQuestion.id, 'question', 'down')}
                    title="Không thích"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H7"></path>
                      <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="question-answers">
              <h3 className="answers-title">
                {selectedQuestion.answers.length > 0
                  ? `${selectedQuestion.answers.length} Câu trả lời`
                  : 'Chưa có câu trả lời'}
              </h3>
              
              {selectedQuestion.answers.map((answer) => (
                <div key={answer.id} className="answer-card">
                  <div className="answer-content">
                    <p>{answer.content}</p>
                  </div>
                  
                  <div className="answer-meta">
                    <div className="answer-votes-actions">
                      <div className="vote-buttons">
                        <button 
                          className={`vote-button ${userVotes.answers[answer.id] === 'up' ? 'active-up' : ''}`}
                          onClick={(e) => handleVote(e, answer.id, 'answer', 'up')}
                          title="Thích"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                          </svg>
                        </button>
                        <span>{answer.votes}</span>
                        <button 
                          className={`vote-button ${userVotes.answers[answer.id] === 'down' ? 'active-down' : ''}`}
                          onClick={(e) => handleVote(e, answer.id, 'answer', 'down')}
                          title="Không thích"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H7"></path>
                            <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="answer-author-info">
                      <div className="answer-attribution">
                        <span>{answer.author}</span>
                        {answer.authorRole === 'consultant' && (
                          <span className="verified-badge" title="Verified Expert">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <span className="answer-date">Trả lời ngày {new Date(answer.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {!selectedQuestion.answered && (
                <div className="no-answers-message">
                  <p>Câu hỏi này chưa có câu trả lời.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="ask-modal-overlay" onClick={() => setShowAskModal(false)}>
          <div className="ask-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setShowAskModal(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <h2>Đặt câu hỏi</h2>
            
            <form className="ask-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="question-title">Tiêu đề</label>
                <input 
                  type="text" 
                  id="question-title" 
                  name="title" 
                  value={newQuestion.title} 
                  onChange={handleFormChange} 
                  placeholder="Nhập tiêu đề ngắn gọn cho câu hỏi của bạn" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="question-content">Chi tiết</label>
                <textarea 
                  id="question-content" 
                  name="content" 
                  value={newQuestion.content} 
                  onChange={handleFormChange} 
                  placeholder="Mô tả chi tiết câu hỏi của bạn" 
                  rows={5} 
                  required 
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="question-category">Danh mục</label>
                <select 
                  id="question-category" 
                  name="category" 
                  value={newQuestion.category} 
                  onChange={handleFormChange} 
                  required
                >
                  <option value="Sức khỏe tình dục">Sức khỏe tình dục</option>
                  <option value="STI">STI</option>
                  <option value="Sức khỏe sinh sản">Sức khỏe sinh sản</option>
                  <option value="Tránh thai">Tránh thai</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAskModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="submit-button">
                  Gửi câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QnA; 