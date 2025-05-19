import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../Styles/updateprofile.css';

const UpdateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    oldPassword: '',
    newPassword: '',
  });
  const [updatePassword, setUpdatePassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/user/profile', {
          headers: getAuthHeader(),
        });
        setProfile(response.data);
        setFormData({
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          oldPassword: '',
          newPassword: '',
        });
        setApiError(null);
      } catch (err) {
        setApiError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'A valid email is required';
    }

    if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (updatePassword) {
      if (!formData.oldPassword) {
        newErrors.oldPassword = 'Old password is required';
      }
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          formData.newPassword
        )
      ) {
        newErrors.newPassword =
          'Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleUpdatePasswordChange = (e) => {
    setUpdatePassword(e.target.checked);
    if (!e.target.checked) {
      setFormData((prev) => ({ ...prev, oldPassword: '', newPassword: '' }));
      setErrors((prev) => ({ ...prev, oldPassword: null, newPassword: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        const updateData = {
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        };
        if (updatePassword) {
          updateData.oldPassword = formData.oldPassword;
          updateData.newPassword = formData.newPassword;
        }

        const data = {
            username: profile.username,
            password: formData.newPassword? formData.newPassword : profile.password,
            email: formData.email,
            fullName: profile.fullName,
            phoneNumber: formData.phoneNumber,
            role: profile.role,
        }

        const response = await axios.put(
          `http://localhost:8080/api/user/update/${profile.id}`,
          data,
          { headers: getAuthHeader() }
        );
        setProfile(response.data);
        setFormData({
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          oldPassword: '',
          newPassword: '',
        });
        setShowModal(false);
        setUpdatePassword(false);
        setApiError(null);
        alert('Profile updated successfully!');
      } catch (err) {
        setApiError(
          err.response?.data?.message || 'Failed to update profile. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: profile?.email || '',
      phoneNumber: profile?.phoneNumber || '',
      oldPassword: '',
      newPassword: '',
    });
    setErrors({});
    setShowModal(false);
    setUpdatePassword(false);
  };

  if (loading && !profile) {
    return (
      <div className="update-upprofile-container">
        <Navbar />
        <p className="update-loading-text">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="update-upprofile-container">
        <Navbar />
        <p className="update-api-error">{apiError || 'Unable to load profile.'}</p>
      </div>
    );
  }

  return (
    <div className="update-upprofile-container">
      <Navbar />
      <div className="update-upprofile-content">
        <div className="update-upprofile-header">
          <h1 className="update-upprofile-title">Inventory System - User Profile</h1>
        </div>

        <div className="update-profile-section">
            <div className="update-profile-container">
          <div className="update-profile-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="update-user-icon"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="update-profile-details">
            <p>
              <strong>Phone Number:</strong> {profile.phoneNumber}
            </p>
            <p>
              <strong>Full Name:</strong> {profile.fullName}
            </p>
            <p>
              <strong>Username:</strong> {profile.username}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
          </div>
          </div>
        </div>

        <button className="update-update-btn" onClick={() => setShowModal(true)}>
          Update Profile
        </button>

        {showModal && (
          <div className="update-modal-overlay">
            <div className="update-modal">
              <h2>Update Profile</h2>
              <form className="update-update-form" onSubmit={handleSubmit}>
                <div className="update-form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'update-input-error' : ''}
                  />
                  {errors.email && <p className="update-error-text">{errors.email}</p>}
                </div>

                <div className="update-form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={errors.phoneNumber ? 'update-input-error' : ''}
                  />
                  {errors.phoneNumber && <p className="update-error-text">{errors.phoneNumber}</p>}
                </div>

                <div className="update-form-group update-checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={updatePassword}
                      onChange={handleUpdatePasswordChange}
                    />
                    Update Password
                  </label>
                </div>

                {updatePassword && (
                  <>
                    <div className="update-form-group">
                      <label htmlFor="oldPassword">Old Password</label>
                      <input
                        type="password"
                        id="oldPassword"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleInputChange}
                        className={errors.oldPassword ? 'update-input-error' : ''}
                      />
                      {errors.oldPassword && (
                        <p className="update-error-text">{errors.oldPassword}</p>
                      )}
                    </div>

                    <div className="update-form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={errors.newPassword ? 'update-input-error' : ''}
                      />
                      {errors.newPassword && (
                        <p className="update-error-text">{errors.newPassword}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="update-modal-actions">
                  <button type="submit" className="update-submit-btn" disabled={loading}>
                    Save Changes
                  </button>
                  <button type="button" className="update-cancel-btn" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {apiError && <p className="update-api-error">{apiError}</p>}
      </div>
    </div>
  );
};

export default UpdateProfile;