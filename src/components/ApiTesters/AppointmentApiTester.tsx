import React, { useState } from 'react';
import { appointmentService } from '../../services';
import type { PaginationParams } from '../../types';

const AppointmentApiTester: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Example values
  const paginationExample: PaginationParams = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'date',
    sortDirection: 'desc',
    searchTerm: ''
  };

  const appointmentCreationExample = {
    serviceId: "42e5d5cd-6e4e-4c0c-903a-18f4a5aed9c0",
    consultantId: "9f8d3e1c-8b2a-4c7f-9a5e-6d7f8c9a0b1c",
    slotId: "7d8c9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
    date: "2023-11-15",
    notes: "Cần tư vấn về sức khỏe sinh sản"
  };

  const statusUpdateExample = {
    appointmentId: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    status: "confirmed",
    notes: "Đã xác nhận cuộc hẹn"
  };

  const rescheduleExample = {
    appointmentId: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    slotId: "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    date: "2023-11-20"
  };

  const handleGetUserAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.getUserAppointments(paginationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetConsultantAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.getConsultantAppointments(paginationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStaffAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.getStaffAppointments(paginationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.getAllAppointments(paginationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.getAppointment(statusUpdateExample.appointmentId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.createAppointment(appointmentCreationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.updateAppointmentStatus(
        statusUpdateExample.appointmentId,
        statusUpdateExample.status,
        statusUpdateExample.notes
      );
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.cancelAppointment(
        statusUpdateExample.appointmentId,
        "Người dùng không thể tham dự"
      );
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.rescheduleAppointment(
        rescheduleExample.appointmentId,
        rescheduleExample.slotId,
        rescheduleExample.date
      );
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-tester">
      <h2>Appointment API Tester</h2>
      
      <div className="api-examples">
        <div className="api-example">
          <h3>Get User Appointments</h3>
          <p>Pagination Parameters:</p>
          <pre>{JSON.stringify(paginationExample, null, 2)}</pre>
          <button onClick={handleGetUserAppointments} disabled={loading}>
            Test Get User Appointments
          </button>
        </div>

        <div className="api-example">
          <h3>Get Consultant Appointments</h3>
          <p>Pagination Parameters:</p>
          <pre>{JSON.stringify(paginationExample, null, 2)}</pre>
          <button onClick={handleGetConsultantAppointments} disabled={loading}>
            Test Get Consultant Appointments
          </button>
        </div>

        <div className="api-example">
          <h3>Get Staff Appointments</h3>
          <p>Pagination Parameters:</p>
          <pre>{JSON.stringify(paginationExample, null, 2)}</pre>
          <button onClick={handleGetStaffAppointments} disabled={loading}>
            Test Get Staff Appointments
          </button>
        </div>

        <div className="api-example">
          <h3>Get All Appointments (Admin)</h3>
          <p>Pagination Parameters:</p>
          <pre>{JSON.stringify(paginationExample, null, 2)}</pre>
          <button onClick={handleGetAllAppointments} disabled={loading}>
            Test Get All Appointments
          </button>
        </div>

        <div className="api-example">
          <h3>Get Appointment by ID</h3>
          <p>Appointment ID: {statusUpdateExample.appointmentId}</p>
          <button onClick={handleGetAppointment} disabled={loading}>
            Test Get Appointment
          </button>
        </div>

        <div className="api-example">
          <h3>Create Appointment</h3>
          <pre>{JSON.stringify(appointmentCreationExample, null, 2)}</pre>
          <button onClick={handleCreateAppointment} disabled={loading}>
            Test Create Appointment
          </button>
        </div>

        <div className="api-example">
          <h3>Update Appointment Status</h3>
          <pre>{JSON.stringify(statusUpdateExample, null, 2)}</pre>
          <button onClick={handleUpdateAppointmentStatus} disabled={loading}>
            Test Update Status
          </button>
        </div>

        <div className="api-example">
          <h3>Cancel Appointment</h3>
          <p>Appointment ID: {statusUpdateExample.appointmentId}</p>
          <p>Reason: "Người dùng không thể tham dự"</p>
          <button onClick={handleCancelAppointment} disabled={loading}>
            Test Cancel Appointment
          </button>
        </div>

        <div className="api-example">
          <h3>Reschedule Appointment</h3>
          <pre>{JSON.stringify(rescheduleExample, null, 2)}</pre>
          <button onClick={handleRescheduleAppointment} disabled={loading}>
            Test Reschedule Appointment
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div className="error">Error: {error}</div>}
      
      {response && (
        <div className="response">
          <h3>Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      <div className="example-response">
        <h3>Example Successful Response:</h3>
        <pre>{JSON.stringify({
          message: "Success",
          statusCode: 200,
          data: {
            items: [
              {
                appointmentId: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
                userId: "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
                userName: "user123",
                serviceId: "42e5d5cd-6e4e-4c0c-903a-18f4a5aed9c0",
                serviceName: "Tư vấn sức khỏe sinh sản",
                consultantId: "9f8d3e1c-8b2a-4c7f-9a5e-6d7f8c9a0b1c",
                consultantName: "Bác sĩ Nguyễn Văn A",
                slotId: "7d8c9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
                slotTime: "09:00 - 10:00",
                date: "2023-11-15",
                status: "scheduled",
                notes: "Cần tư vấn về sức khỏe sinh sản",
                createdAt: "2023-11-10T14:30:00.000Z",
                updatedAt: "2023-11-10T14:30:00.000Z"
              }
            ],
            totalCount: 1,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1
          }
        }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default AppointmentApiTester; 