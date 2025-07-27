import React, { useState } from 'react';
import intelligentChatService from '../../services/intelligentChatService';
import ChatbotService from '../../services/chatbotService';
import ChatBot from './ChatBot';

/**
 * Demo component để showcase tính năng thông minh của ChatBot
 */
const IntelligentChatBotDemo: React.FC = () => {
  const [demoResponse, setDemoResponse] = useState<string>('');
  const [testMessage, setTestMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const capabilities = intelligentChatService.getBotCapabilities();
  const suggestedQuestions = ChatbotService.getSuggestedQuestions();

  const testIntelligentResponse = async () => {
    if (!testMessage.trim()) return;
    
    setLoading(true);
    try {
      const response = await ChatbotService.processIntelligentMessage(testMessage);
      setDemoResponse(response);
    } catch (error) {
      setDemoResponse('Lỗi khi xử lý tin nhắn: ' + error);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      padding: '20px', 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🤖 Intelligent ChatBot Demo</h1>
      <p>Chatbot thông minh tích hợp đầy đủ API từ Swagger để hỗ trợ người dùng thực tế.</p>
      
      {/* Bot Capabilities */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2>🚀 Khả năng của Bot</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <h4>📊 Thống kê</h4>
            <p><strong>Tổng số ý định:</strong> {capabilities.totalIntents}</p>
            <p><strong>API endpoints:</strong> {capabilities.apiEndpoints}</p>
            <p><strong>Danh mục:</strong> {capabilities.categories.length}</p>
          </div>
          <div>
            <h4>🎯 Danh mục hỗ trợ</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {capabilities.categories.map((category, index) => (
                <li key={index} style={{ padding: '2px 0' }}>
                  🔸 {category}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>✨ Tính năng</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {capabilities.features.map((feature, index) => (
                <li key={index} style={{ padding: '2px 0' }}>
                  ✅ {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2>💡 Câu hỏi gợi ý</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setTestMessage(question)}
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Test Interface */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2>🧪 Test Intelligent Response</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid #e0e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onKeyPress={(e) => e.key === 'Enter' && testIntelligentResponse()}
          />
          <button
            onClick={testIntelligentResponse}
            disabled={loading || !testMessage.trim()}
            style={{
              padding: '12px 24px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {loading ? '⏳ Đang xử lý...' : '🚀 Test'}
          </button>
        </div>
        
        {demoResponse && (
          <div style={{
            background: '#f8f9ff',
            padding: '16px',
            borderRadius: '8px',
            border: '2px solid #e0e8f0',
            marginTop: '16px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🤖 Bot Response:</h4>
            <div style={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: '1.6',
              color: '#555',
              fontSize: '14px'
            }}>
              {demoResponse}
            </div>
          </div>
        )}
      </div>

      {/* API Integration Status */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2>🔗 API Integration Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4>📅 Appointment APIs</h4>
            <p>✅ GetAllAppointment</p>
            <p>✅ GetAppointmentByCustomerID</p>
            <p>✅ CreateAppointment</p>
            <p>✅ UpdateAppointment</p>
            <p>✅ ChangeAppointmentStatus</p>
          </div>
          <div>
            <h4>💊 Service APIs</h4>
            <p>✅ GetService</p>
            <p>✅ GetServiceStats</p>
            <p>✅ CreateService</p>
            <p>✅ UpdateService</p>
          </div>
          <div>
            <h4>👩‍⚕️ Consultant APIs</h4>
            <p>✅ GetAllConsultantProfile</p>
            <p>✅ GetConsultantProfileByAccountId</p>
            <p>✅ CreateConsultantProfile</p>
            <p>✅ UpdateConsultantProfile</p>
          </div>
          <div>
            <h4>📊 Analytics APIs</h4>
            <p>✅ CyclePrediction</p>
            <p>✅ LabTest</p>
            <p>✅ TreatmentOutcome</p>
            <p>✅ Transaction</p>
            <p>✅ Dashboard</p>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2>💬 Ví dụ sử dụng</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <h4>📅 Quản lý lịch hẹn</h4>
            <div style={{ fontSize: '13px', color: '#666' }}>
              <p>"Lịch hẹn của tôi hôm nay"</p>
              <p>"Đặt lịch khám STI"</p>
              <p>"Hủy cuộc hẹn #12345"</p>
              <p>"Thay đổi giờ hẹn"</p>
            </div>
          </div>
          <div>
            <h4>💊 Thông tin dịch vụ</h4>
            <div style={{ fontSize: '13px', color: '#666' }}>
              <p>"Dịch vụ gì có sẵn?"</p>
              <p>"Giá xét nghiệm STI"</p>
              <p>"Tư vấn sức khỏe sinh sản"</p>
              <p>"So sánh các gói dịch vụ"</p>
            </div>
          </div>
          <div>
            <h4>👩‍⚕️ Tư vấn viên</h4>
            <div style={{ fontSize: '13px', color: '#666' }}>
              <p>"Danh sách bác sĩ"</p>
              <p>"Tư vấn viên chuyên khoa"</p>
              <p>"Kinh nghiệm Dr. Smith"</p>
              <p>"Lịch làm việc tư vấn viên"</p>
            </div>
          </div>
          <div>
            <h4>📊 Theo dõi sức khỏe</h4>
            <div style={{ fontSize: '13px', color: '#666' }}>
              <p>"Chu kỳ kinh nguyệt của tôi"</p>
              <p>"Kết quả xét nghiệm mới nhất"</p>
              <p>"Lịch sử điều trị"</p>
              <p>"Nhắc nhở uống thuốc"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live ChatBot */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2>💬 Live ChatBot</h2>
        <p>Chatbot thông minh đã được tích hợp ở góc dưới bên phải màn hình. Click vào để trải nghiệm!</p>
        <div style={{
          padding: '16px',
          background: '#f8f9ff',
          borderRadius: '8px',
          border: '2px dashed #667eea'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
            🎯 <strong>Thử ngay:</strong> Click vào icon chat ở góc dưới bên phải để trải nghiệm chatbot thông minh với đầy đủ tính năng API integration!
          </p>
        </div>
      </div>

      {/* ChatBot Component */}
      <ChatBot consultantId="demo-intelligent-consultant" />
    </div>
  );
};

export default IntelligentChatBotDemo;
