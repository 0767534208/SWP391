import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Giả lập gửi form thành công
    setSubmitted(true);
    // Reset form sau 3 giây
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title">Liên hệ với chúng tôi</h1>
      <p className="contact-subtitle">Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào</p>
      
      <div className="contact-content">
        <div className="contact-form-container">
          {submitted ? (
            <div className="success-message">
              <h3>Cảm ơn bạn đã liên hệ!</h3>
              <p>Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Họ và tên</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Nội dung tin nhắn</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={5} 
                  value={formData.message} 
                  onChange={handleChange} 
                  required 
                ></textarea>
              </div>
              
              <button type="submit" className="submit-button">Gửi tin nhắn</button>
            </form>
          )}
        </div>
        
        <div className="contact-info">
          <div className="info-card">
            <h3>Thông tin liên hệ</h3>
            <p><strong>Địa chỉ:</strong> 123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</p>
            <p><strong>Điện thoại:</strong> (028) 1234 5678</p>
            <p><strong>Email:</strong> info@healthcarecenter.com</p>
            <p><strong>Giờ làm việc:</strong> Thứ 2 - Thứ 6: 8:00 - 17:00</p>
          </div>
          
          <div className="map-container">
            <h3>Bản đồ</h3>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0246825929527!2d106.69758731474399!3d10.732675992347597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f62a90e5dbd%3A0x674d5126513db295!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1653464714224!5m2!1svi!2s" 
              width="100%" 
              height="300" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;