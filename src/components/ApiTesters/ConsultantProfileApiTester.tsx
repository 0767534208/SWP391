/**
 * Test component to demonstrate the new consultant profile API functions
 */

import React, { useState } from 'react';
import consultantService from '../../services/consultantService';
import { toast } from 'react-hot-toast';
import type { CreateConsultantProfileRequest, UpdateConsultantProfileRequest } from '../../types';

const ConsultantProfileApiTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [createForm, setCreateForm] = useState<CreateConsultantProfileRequest>({
    accountID: '',
    description: '',
    specialty: '',
    experience: '',
    consultantPrice: 0
  });
  const [updateForm, setUpdateForm] = useState<UpdateConsultantProfileRequest>({
    description: '',
    specialty: '',
    experience: '',
    consultantPrice: 0
  });
  const [consultantProfileID, setConsultantProfileID] = useState<number>(1);

  // Test CREATE consultant profile
  const handleCreateProfile = async () => {
    if (!createForm.accountID || !createForm.description || !createForm.specialty || !createForm.experience) {
      toast.error('All fields are required for creating a consultant profile');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating consultant profile with data:', createForm);
      const response = await consultantService.createConsultantProfile(createForm);
      console.log('Create response:', response);
      
      if (response && response.data) {
        toast.success('Consultant profile created successfully!');
        // Reset form
        setCreateForm({
          accountID: '',
          description: '',
          specialty: '',
          experience: '',
          consultantPrice: 0
        });
      } else {
        toast.error('Failed to create consultant profile');
      }
    } catch (error) {
      console.error('Error creating consultant profile:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test UPDATE consultant profile
  const handleUpdateProfile = async () => {
    if (!updateForm.description || !updateForm.specialty || !updateForm.experience) {
      toast.error('All fields are required for updating a consultant profile');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Updating consultant profile ID:', consultantProfileID);
      console.log('Update data:', updateForm);
      
      const response = await consultantService.updateConsultantProfile(consultantProfileID, updateForm);
      console.log('Update response:', response);
      
      if (response && response.data) {
        toast.success('Consultant profile updated successfully!');
      } else {
        toast.error('Failed to update consultant profile');
      }
    } catch (error) {
      console.error('Error updating consultant profile:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Consultant Profile API Test</h1>
      
      {/* CREATE CONSULTANT PROFILE */}
      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Create Consultant Profile</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label>Account ID:</label>
            <input
              type="text"
              value={createForm.accountID}
              onChange={(e) => setCreateForm(prev => ({ ...prev, accountID: e.target.value }))}
              placeholder="Enter account ID (e.g., 01eb9f40-4287-4631-8a6f-b982113fbaea)"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
            />
          </div>
          <div>
            <label>Specialty:</label>
            <input
              type="text"
              value={createForm.specialty}
              onChange={(e) => setCreateForm(prev => ({ ...prev, specialty: e.target.value }))}
              placeholder="Enter specialty"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Experience:</label>
            <input
              type="text"
              value={createForm.experience}
              onChange={(e) => setCreateForm(prev => ({ ...prev, experience: e.target.value }))}
              placeholder="Enter experience"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Consultant Price:</label>
            <input
              type="number"
              value={createForm.consultantPrice}
              onChange={(e) => setCreateForm(prev => ({ ...prev, consultantPrice: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter price"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <button
            onClick={handleCreateProfile}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Creating...' : 'Create Consultant Profile'}
          </button>
        </div>
      </div>

      {/* UPDATE CONSULTANT PROFILE */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Update Consultant Profile</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label>Consultant Profile ID:</label>
            <input
              type="number"
              value={consultantProfileID}
              onChange={(e) => setConsultantProfileID(parseInt(e.target.value) || 1)}
              placeholder="Enter consultant profile ID"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea
              value={updateForm.description}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
            />
          </div>
          <div>
            <label>Specialty:</label>
            <input
              type="text"
              value={updateForm.specialty}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, specialty: e.target.value }))}
              placeholder="Enter specialty"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Experience:</label>
            <input
              type="text"
              value={updateForm.experience}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, experience: e.target.value }))}
              placeholder="Enter experience"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Consultant Price:</label>
            <input
              type="number"
              value={updateForm.consultantPrice}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, consultantPrice: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter price"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <button
            onClick={handleUpdateProfile}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Updating...' : 'Update Consultant Profile'}
          </button>
        </div>
      </div>

      {/* API USAGE EXAMPLES */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>API Usage Examples</h2>
        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
          <h3>Create Consultant Profile:</h3>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '4px' }}>
{`const createData = {
  accountID: "01eb9f40-4287-4631-8a6f-b982113fbaea",
  description: "Experienced consultant",
  specialty: "Women's Health",
  experience: "5 years",
  consultantPrice: 350000
};

const response = await consultantService.createConsultantProfile(createData);`}
          </pre>

          <h3>Update Consultant Profile:</h3>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '4px' }}>
{`const updateData = {
  description: "Updated description",
  specialty: "Updated specialty",
  experience: "Updated experience",
  consultantPrice: 400000
};

const response = await consultantService.updateConsultantProfile(1, updateData);`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ConsultantProfileApiTest;
