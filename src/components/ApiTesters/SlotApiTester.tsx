import React, { useState } from 'react';
import { slotService } from '../../services';
import type { PaginationParams } from '../../types';

const SlotApiTester: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Example values
  const paginationExample: PaginationParams = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'startTime',
    sortDirection: 'asc',
    searchTerm: ''
  };

  const slotCreationExample = {
    startTime: "09:00:00",
    endTime: "10:00:00",
    consultantId: "9f8d3e1c-8b2a-4c7f-9a5e-6d7f8c9a0b1c",
    date: "2023-11-15"
  };

  const multipleSlotCreationExample = {
    startDate: "2023-11-15",
    endDate: "2023-11-30",
    startTime: "09:00:00",
    endTime: "17:00:00",
    interval: 60,
    consultantId: "9f8d3e1c-8b2a-4c7f-9a5e-6d7f8c9a0b1c",
    daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
  };

  const slotUpdateExample = {
    slotId: "7d8c9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
    startTime: "10:00:00",
    endTime: "11:00:00",
    date: "2023-11-15"
  };

  const batchDeleteExample = {
    startDate: "2023-11-15",
    endDate: "2023-11-30",
    consultantId: "9f8d3e1c-8b2a-4c7f-9a5e-6d7f8c9a0b1c"
  };

  const handleGetAllSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.getAllSlots(paginationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSlotsByDate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.getSlotsByDate(slotCreationExample.date);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSlotsByConsultant = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.getSlotsByConsultant(slotCreationExample.consultantId || "");
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSlotsByConsultantAndDate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.getSlotsByConsultantAndDate(
        slotCreationExample.consultantId || "",
        slotCreationExample.date
      );
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSlot = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.getSlot(slotUpdateExample.slotId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.createSlot(slotCreationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMultipleSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.createMultipleSlots(
        multipleSlotCreationExample.startDate,
        multipleSlotCreationExample.endDate,
        multipleSlotCreationExample.startTime,
        multipleSlotCreationExample.endTime,
        multipleSlotCreationExample.interval,
        multipleSlotCreationExample.consultantId,
        multipleSlotCreationExample.daysOfWeek
      );
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlot = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.updateSlot(slotUpdateExample.slotId, {
        startTime: slotUpdateExample.startTime,
        endTime: slotUpdateExample.endTime,
        date: slotUpdateExample.date
      });
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetSlotAvailability = async (isAvailable: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.setSlotAvailability(slotUpdateExample.slotId, isAvailable);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignConsultant = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.assignConsultant(
        slotUpdateExample.slotId,
        slotCreationExample.consultantId || ""
      );
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConsultant = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.removeConsultant(slotUpdateExample.slotId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.deleteSlot(slotUpdateExample.slotId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMultipleSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await slotService.deleteMultipleSlots(
        batchDeleteExample.startDate,
        batchDeleteExample.endDate,
        batchDeleteExample.consultantId
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
      <h2>Slot API Tester</h2>
      
      <div className="api-examples">
        <div className="api-example">
          <h3>Get All Slots</h3>
          <p>Pagination Parameters:</p>
          <pre>{JSON.stringify(paginationExample, null, 2)}</pre>
          <button onClick={handleGetAllSlots} disabled={loading}>
            Test Get All Slots
          </button>
        </div>

        <div className="api-example">
          <h3>Get Slots By Date</h3>
          <p>Date: {slotCreationExample.date}</p>
          <button onClick={handleGetSlotsByDate} disabled={loading}>
            Test Get Slots By Date
          </button>
        </div>

        <div className="api-example">
          <h3>Get Slots By Consultant</h3>
          <p>Consultant ID: {slotCreationExample.consultantId}</p>
          <button onClick={handleGetSlotsByConsultant} disabled={loading}>
            Test Get Slots By Consultant
          </button>
        </div>

        <div className="api-example">
          <h3>Get Slots By Consultant And Date</h3>
          <p>Consultant ID: {slotCreationExample.consultantId}</p>
          <p>Date: {slotCreationExample.date}</p>
          <button onClick={handleGetSlotsByConsultantAndDate} disabled={loading}>
            Test Get Slots By Consultant And Date
          </button>
        </div>

        <div className="api-example">
          <h3>Get Slot By ID</h3>
          <p>Slot ID: {slotUpdateExample.slotId}</p>
          <button onClick={handleGetSlot} disabled={loading}>
            Test Get Slot
          </button>
        </div>

        <div className="api-example">
          <h3>Create Slot</h3>
          <pre>{JSON.stringify(slotCreationExample, null, 2)}</pre>
          <button onClick={handleCreateSlot} disabled={loading}>
            Test Create Slot
          </button>
        </div>

        <div className="api-example">
          <h3>Create Multiple Slots</h3>
          <pre>{JSON.stringify(multipleSlotCreationExample, null, 2)}</pre>
          <button onClick={handleCreateMultipleSlots} disabled={loading}>
            Test Create Multiple Slots
          </button>
        </div>

        <div className="api-example">
          <h3>Update Slot</h3>
          <pre>{JSON.stringify(slotUpdateExample, null, 2)}</pre>
          <button onClick={handleUpdateSlot} disabled={loading}>
            Test Update Slot
          </button>
        </div>

        <div className="api-example">
          <h3>Set Slot Availability</h3>
          <p>Slot ID: {slotUpdateExample.slotId}</p>
          <div className="button-group">
            <button 
              onClick={() => handleSetSlotAvailability(true)} 
              disabled={loading}
              className="button-positive"
            >
              Set Available
            </button>
            <button 
              onClick={() => handleSetSlotAvailability(false)} 
              disabled={loading}
              className="button-negative"
            >
              Set Unavailable
            </button>
          </div>
        </div>

        <div className="api-example">
          <h3>Assign Consultant to Slot</h3>
          <p>Slot ID: {slotUpdateExample.slotId}</p>
          <p>Consultant ID: {slotCreationExample.consultantId}</p>
          <button onClick={handleAssignConsultant} disabled={loading}>
            Test Assign Consultant
          </button>
        </div>

        <div className="api-example">
          <h3>Remove Consultant from Slot</h3>
          <p>Slot ID: {slotUpdateExample.slotId}</p>
          <button onClick={handleRemoveConsultant} disabled={loading}>
            Test Remove Consultant
          </button>
        </div>

        <div className="api-example">
          <h3>Delete Slot</h3>
          <p>Slot ID: {slotUpdateExample.slotId}</p>
          <button onClick={handleDeleteSlot} disabled={loading}>
            Test Delete Slot
          </button>
        </div>

        <div className="api-example">
          <h3>Delete Multiple Slots</h3>
          <pre>{JSON.stringify(batchDeleteExample, null, 2)}</pre>
          <button onClick={handleDeleteMultipleSlots} disabled={loading}>
            Test Delete Multiple Slots
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
        <h3>Example Slot Response:</h3>
        <pre>{JSON.stringify({
          message: "Success",
          statusCode: 200,
          data: {
            slotId: "7d8c9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
            startTime: "09:00:00",
            endTime: "10:00:00",
            isAvailable: true,
            consultantId: "9f8d3e1c-8b2a-4c7f-9a5e-6d7f8c9a0b1c"
          }
        }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default SlotApiTester; 