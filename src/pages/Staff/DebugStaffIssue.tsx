import React, { useState } from 'react';
import { appointmentAPI } from '../../utils/api';
import treatmentOutcomeService from '../../services/treatmentOutcomeService';

const DebugStaffIssue: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAppointment1Status = async () => {
    setLoading(true);
    try {
      // First get the current appointment data
      const appointments = await appointmentAPI.getAllAppointments();
      const appointment1 = appointments.data?.find(apt => apt.appointmentID.toString() === '1');
      
      setResult(`Appointment 1 data:\n${JSON.stringify(appointment1, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testTreatmentOutcomeForAppointment1 = async () => {
    setLoading(true);
    try {
      const treatmentOutcomes = await treatmentOutcomeService.getTreatmentOutcomesByAppointment(1);
      setResult(`TreatmentOutcomes for appointment 1:\n${JSON.stringify(treatmentOutcomes, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateTreatmentOutcomeForAppointment1 = async () => {
    setLoading(true);
    try {
      const createData = {
        customerID: "73539b7a-f7e5-4889-a662-b71c9bbf7e88",
        consultantID: "01eb9f40-4287-4631-8a6f-b982113fbaea",
        appointmentID: 1,
        diagnosis: "Đang chờ kết quả xét nghiệm",
        treatmentPlan: "Xét nghiệm STI theo yêu cầu",
        prescription: "",
        recommendation: "Chờ kết quả xét nghiệm để đưa ra khuyến nghị cụ thể"
      };

      const response = await treatmentOutcomeService.createTreatmentOutcome(createData);
      setResult(`Created TreatmentOutcome:\n${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testChangeStatusToAwaitingResults = async () => {
    setLoading(true);
    try {
      // Try to change appointment 1 status to awaiting_results (status 4)
      const response = await appointmentAPI.changeAppointmentStatus(1, 4, 2);
      setResult(`Status change response:\n${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1>Debug Staff Issue - Appointment 1</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Steps:</h3>
        <p>1. First check appointment 1 data</p>
        <p>2. Check if TreatmentOutcome exists for appointment 1</p>
        <p>3. If not, create TreatmentOutcome</p>
        <p>4. Try to change status to awaiting_results</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testAppointment1Status} disabled={loading} style={{ margin: '5px' }}>
          1. Get Appointment 1 Data
        </button>
        <button onClick={testTreatmentOutcomeForAppointment1} disabled={loading} style={{ margin: '5px' }}>
          2. Check TreatmentOutcome
        </button>
        <button onClick={testCreateTreatmentOutcomeForAppointment1} disabled={loading} style={{ margin: '5px' }}>
          3. Create TreatmentOutcome
        </button>
        <button onClick={testChangeStatusToAwaitingResults} disabled={loading} style={{ margin: '5px' }}>
          4. Change Status
        </button>
      </div>

      <div>
        <h3>Result:</h3>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          border: '1px solid #ddd',
          maxHeight: '400px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {loading ? 'Loading...' : result}
        </pre>
      </div>
    </div>
  );
};

export default DebugStaffIssue;
