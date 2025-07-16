import React, { useState } from 'react';
import AuthApiTester from './AuthApiTester';
import UserApiTester from './UserApiTester';
import AppointmentApiTester from './AppointmentApiTester';
import SlotApiTester from './SlotApiTester';
import ServiceApiTester from './ServiceApiTester';
import BlogApiTester from './BlogApiTester';
import ConsultantProfileApiTester from './ConsultantProfileApiTester';
import './ApiTester.css';

// Define available testers
type TesterType = 'auth' | 'user' | 'appointment' | 'slot' | 'service' | 'blog' | 'consultant';

const ApiTesters: React.FC = () => {
  const [activeTester, setActiveTester] = useState<TesterType>('auth');

  const renderTester = () => {
    switch (activeTester) {
      case 'auth':
        return <AuthApiTester />;
      case 'user':
        return <UserApiTester />;
      case 'appointment':
        return <AppointmentApiTester />;
      case 'slot':
        return <SlotApiTester />;
      case 'service':
        return <ServiceApiTester />;
      case 'blog':
        return <BlogApiTester />;
      case 'consultant':
        return <ConsultantProfileApiTester />;
      default:
        return <div>Select an API tester from the tabs above.</div>;
    }
  };

  return (
    <div className="api-testers-container">
      <h1>API Integration Testers</h1>
      <p>Use these components to test API integration with example values</p>
      
      <div className="api-tabs">
        <button 
          className={`api-tab ${activeTester === 'auth' ? 'active' : ''}`}
          onClick={() => setActiveTester('auth')}
        >
          Auth API
        </button>
        <button 
          className={`api-tab ${activeTester === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTester('user')}
        >
          User API
        </button>
        <button 
          className={`api-tab ${activeTester === 'appointment' ? 'active' : ''}`}
          onClick={() => setActiveTester('appointment')}
        >
          Appointment API
        </button>
        <button 
          className={`api-tab ${activeTester === 'slot' ? 'active' : ''}`}
          onClick={() => setActiveTester('slot')}
        >
          Slot API
        </button>
        <button 
          className={`api-tab ${activeTester === 'service' ? 'active' : ''}`}
          onClick={() => setActiveTester('service')}
        >
          Service API
        </button>
        <button 
          className={`api-tab ${activeTester === 'blog' ? 'active' : ''}`}
          onClick={() => setActiveTester('blog')}
        >
          Blog API
        </button>
        <button 
          className={`api-tab ${activeTester === 'consultant' ? 'active' : ''}`}
          onClick={() => setActiveTester('consultant')}
        >
          Consultant API
        </button>
      </div>
      
      <div className="api-tester-content">
        {renderTester()}
      </div>

      <div className="api-info">
        <h2>API Information</h2>
        <p>Base URL: <code>https://ghsmsystemdemopublish.azurewebsites.net/api</code></p>
        <p>All API calls require authentication except for the public endpoints (login, register, etc.)</p>
        <p>View the complete API documentation at: <a href="https://ghsmsystemdemopublish.azurewebsites.net/swagger/index.html" target="_blank" rel="noopener noreferrer">Swagger API Docs</a></p>
      </div>
    </div>
  );
};

export default ApiTesters; 