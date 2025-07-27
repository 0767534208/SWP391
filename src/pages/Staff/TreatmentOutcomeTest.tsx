import React, { useState } from 'react';
import treatmentOutcomeService from '../../services/treatmentOutcomeService';

const TreatmentOutcomeTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCreateTreatmentOutcome = async () => {
    setLoading(true);
    try {
      const createData = {
        customerID: "73539b7a-f7e5-4889-a662-b71c9bbf7e88",
        consultantID: "01eb9f40-4287-4631-8a6f-b982113fbaea",
        appointmentID: 1,
        diagnosis: "Test diagnosis",
        treatmentPlan: "Test treatment plan",
        prescription: "Test prescription",
        recommendation: "Test recommendation"
      };

      const response = await treatmentOutcomeService.createTreatmentOutcome(createData);
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetTreatmentOutcomes = async () => {
    setLoading(true);
    try {
      const response = await treatmentOutcomeService.getAllTreatmentOutcomes();
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetByAppointment = async () => {
    setLoading(true);
    try {
      const response = await treatmentOutcomeService.getTreatmentOutcomesByAppointment(1);
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>TreatmentOutcome API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testCreateTreatmentOutcome} disabled={loading}>
          Test Create TreatmentOutcome
        </button>
        <button onClick={testGetTreatmentOutcomes} disabled={loading} style={{ marginLeft: '10px' }}>
          Test Get All TreatmentOutcomes
        </button>
        <button onClick={testGetByAppointment} disabled={loading} style={{ marginLeft: '10px' }}>
          Test Get By Appointment 1
        </button>
      </div>

      <div>
        <h3>Result:</h3>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          border: '1px solid #ddd',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {loading ? 'Loading...' : result}
        </pre>
      </div>
    </div>
  );
};

export default TreatmentOutcomeTest;
