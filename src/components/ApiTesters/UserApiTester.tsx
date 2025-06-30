import React, { useState } from 'react';
import { userAPI } from '../../services';

const UserApiTester: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Example values
  const profileUpdateExample = {
    name: "Updated Name",
    address: "456 New St, Updated City",
    phone: "0987654321",
    dateOfBirth: "1999-12-31"
  };

  const changePasswordExample = {
    currentPassword: "OldPassword123!",
    newPassword: "NewPassword123!"
  };

  const handleGetProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPI.getProfile();
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPI.updateProfile(profileUpdateExample);
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userAPI.changePassword(
        changePasswordExample.currentPassword,
        changePasswordExample.newPassword
      );
      setResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    setLoading(true);
    setError(null);
    try {
      // Note: In a real implementation, you would get the file from an input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.onchange = async (e: any) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          try {
            const result = await userAPI.uploadProfilePicture(file);
            setResponse(result);
          } catch (err: any) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }
      };
      fileInput.click();
      // Note: This is just for demonstration purposes
      // In a real app, you'd integrate with a proper file upload component
      setResponse({
        message: "Upload process initiated. Please select a file.",
        statusCode: null,
        data: null
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="api-tester">
      <h2>User API Tester</h2>
      
      <div className="api-examples">
        <div className="api-example">
          <h3>Get User Profile</h3>
          <p>Fetches the current user's profile data</p>
          <button onClick={handleGetProfile} disabled={loading}>
            Test Get Profile
          </button>
        </div>

        <div className="api-example">
          <h3>Update Profile Example</h3>
          <pre>{JSON.stringify(profileUpdateExample, null, 2)}</pre>
          <button onClick={handleUpdateProfile} disabled={loading}>
            Test Update Profile
          </button>
        </div>

        <div className="api-example">
          <h3>Change Password Example</h3>
          <pre>{JSON.stringify(changePasswordExample, null, 2)}</pre>
          <button onClick={handleChangePassword} disabled={loading}>
            Test Change Password
          </button>
        </div>

        <div className="api-example">
          <h3>Upload Profile Picture</h3>
          <p>Upload a profile picture (will open file dialog)</p>
          <button onClick={handleUploadProfilePicture} disabled={loading}>
            Test Upload Profile Picture
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
    </div>
  );
};

export default UserApiTester; 