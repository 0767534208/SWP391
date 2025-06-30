import React, { useState } from 'react';
import { serviceService } from '../../services';
import type { PaginationParams } from '../../types';

const ServiceApiTester: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Example values
  const paginationExample: PaginationParams = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'serviceName',
    sortDirection: 'asc',
    searchTerm: ''
  };

  const serviceCreationExample = {
    serviceName: "Tư vấn sức khỏe sinh sản",
    description: "Dịch vụ tư vấn về các vấn đề sức khỏe sinh sản cho phụ nữ.",
    price: 500000,
    duration: 60
  };

  const serviceUpdateExample = {
    serviceId: "42e5d5cd-6e4e-4c0c-903a-18f4a5aed9c0",
    serviceName: "Tư vấn sức khỏe sinh sản và kế hoạch hóa gia đình",
    description: "Dịch vụ tư vấn toàn diện về các vấn đề sức khỏe sinh sản và kế hoạch hóa gia đình.",
    price: 600000,
    duration: 90
  };

  const handleGetActiveServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceService.getActiveServices();
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceService.getAllServices(paginationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetService = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceService.getService(serviceUpdateExample.serviceId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceService.createService(serviceCreationExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateService = async () => {
    setLoading(true);
    setError(null);
    try {
      const { serviceId, ...updateData } = serviceUpdateExample;
      const result = await serviceService.updateService(serviceId, updateData);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateService = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceService.activateService(serviceUpdateExample.serviceId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateService = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceService.deactivateService(serviceUpdateExample.serviceId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceService.deleteService(serviceUpdateExample.serviceId);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-tester">
      <h2>Service API Tester</h2>
      
      <div className="api-examples">
        <div className="api-example">
          <h3>Get Active Services</h3>
          <p>Fetches all active services</p>
          <button onClick={handleGetActiveServices} disabled={loading}>
            Test Get Active Services
          </button>
        </div>

        <div className="api-example">
          <h3>Get All Services (Admin/Manager)</h3>
          <p>Pagination Parameters:</p>
          <pre>{JSON.stringify(paginationExample, null, 2)}</pre>
          <button onClick={handleGetAllServices} disabled={loading}>
            Test Get All Services
          </button>
        </div>

        <div className="api-example">
          <h3>Get Service by ID</h3>
          <p>Service ID: {serviceUpdateExample.serviceId}</p>
          <button onClick={handleGetService} disabled={loading}>
            Test Get Service
          </button>
        </div>

        <div className="api-example">
          <h3>Create Service</h3>
          <pre>{JSON.stringify(serviceCreationExample, null, 2)}</pre>
          <button onClick={handleCreateService} disabled={loading}>
            Test Create Service
          </button>
        </div>

        <div className="api-example">
          <h3>Update Service</h3>
          <pre>{JSON.stringify(serviceUpdateExample, null, 2)}</pre>
          <button onClick={handleUpdateService} disabled={loading}>
            Test Update Service
          </button>
        </div>

        <div className="api-example">
          <h3>Activate Service</h3>
          <p>Service ID: {serviceUpdateExample.serviceId}</p>
          <button onClick={handleActivateService} disabled={loading}>
            Test Activate Service
          </button>
        </div>

        <div className="api-example">
          <h3>Deactivate Service</h3>
          <p>Service ID: {serviceUpdateExample.serviceId}</p>
          <button onClick={handleDeactivateService} disabled={loading}>
            Test Deactivate Service
          </button>
        </div>

        <div className="api-example">
          <h3>Delete Service</h3>
          <p>Service ID: {serviceUpdateExample.serviceId}</p>
          <button onClick={handleDeleteService} disabled={loading}>
            Test Delete Service
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
        <h3>Example Service Response:</h3>
        <pre>{JSON.stringify({
          message: "Success",
          statusCode: 200,
          data: {
            serviceId: "42e5d5cd-6e4e-4c0c-903a-18f4a5aed9c0",
            serviceName: "Tư vấn sức khỏe sinh sản",
            description: "Dịch vụ tư vấn về các vấn đề sức khỏe sinh sản cho phụ nữ.",
            price: 500000,
            duration: 60,
            isActive: true
          }
        }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ServiceApiTester; 