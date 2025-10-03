import React, { useState } from 'react';
import { X, FileText, User, Mail, Phone, MessageSquare, Upload, CheckCircle, AlertCircle, Building2, DollarSign, Calendar, Briefcase, Users, FileImage, Plus, Trash2 } from 'lucide-react';
import { submitApplication, expressInterest, checkExistingApplication, checkExistingInterest } from '../firebase/applicationService.js';
import '../styles/ApplicationModal.css';

const ApplicationModal = ({ 
  isOpen, 
  onClose, 
  property, 
  user, 
  type = 'application' // 'application' or 'interest'
}) => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    
    // Employment Information
    employment: '',
    employer: '',
    jobTitle: '',
    income: '',
    employmentStartDate: '',
    employmentType: 'full-time',
    
    // Rental Information
    moveInDate: '',
    leaseLength: '12',
    currentAddress: '',
    currentLandlord: '',
    currentLandlordPhone: '',
    reasonForMoving: '',
    
    // References
    references: [
      { name: '', relationship: '', phone: '', email: '' },
      { name: '', relationship: '', phone: '', email: '' }
    ],
    
    // Additional Information
    pets: 'none',
    smoking: 'non-smoker',
    additionalInfo: '',
    message: '',
    
    // Documents
    documents: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [existingInterest, setExistingInterest] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);

  React.useEffect(() => {
    if (isOpen && property && user) {
      checkExistingSubmissions();
    }
  }, [isOpen, property, user]);

  const checkExistingSubmissions = async () => {
    try {
      const [appResult, interestResult] = await Promise.all([
        checkExistingApplication(user.uid, property.id),
        checkExistingInterest(user.uid, property.id)
      ]);

      if (appResult.success && appResult.data.length > 0) {
        setExistingApplication(appResult.data[0]);
      }
      if (interestResult.success && interestResult.data.length > 0) {
        setExistingInterest(interestResult.data[0]);
      }
    } catch (error) {
      console.error('Error checking existing submissions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleReferenceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { name: '', relationship: '', phone: '', email: '' }]
    }));
  };

  const removeReference = (index) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadingDocuments(true);
    
    try {
      // TODO: Implement document upload to Firebase Storage
      const uploadedDocs = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file) // Temporary URL for preview
      }));
      
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...uploadedDocs]
      }));
    } catch (error) {
      console.error('Error uploading documents:', error);
      setError('Failed to upload documents. Please try again.');
    } finally {
      setUploadingDocuments(false);
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (type === 'application' && existingApplication) {
      setError('You have already applied for this property');
      return;
    }
    
    if (type === 'interest' && existingInterest) {
      setError('You have already expressed interest in this property');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submissionData = {
        tenantId: user.uid,
        tenantName: `${user.firstName} ${user.lastName}`,
        tenantEmail: user.email,
        propertyId: property.id,
        propertyTitle: property.title,
        landlordId: property.landlordId,
        ...formData
      };

      let result;
      if (type === 'application') {
        result = await submitApplication(submissionData);
      } else {
        result = await expressInterest(submissionData);
      }

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setCurrentStep(1);
          setFormData({
            // Personal Information
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || '',
            email: user?.email || '',
            dateOfBirth: '',
            emergencyContact: {
              name: '',
              relationship: '',
              phone: ''
            },
            
            // Employment Information
            employment: '',
            employer: '',
            jobTitle: '',
            income: '',
            employmentStartDate: '',
            employmentType: 'full-time',
            
            // Rental Information
            moveInDate: '',
            leaseLength: '12',
            currentAddress: '',
            currentLandlord: '',
            currentLandlordPhone: '',
            reasonForMoving: '',
            
            // References
            references: [
              { name: '', relationship: '', phone: '', email: '' },
              { name: '', relationship: '', phone: '', email: '' }
            ],
            
            // Additional Information
            pets: 'none',
            smoking: 'non-smoker',
            additionalInfo: '',
            message: '',
            
            // Documents
            documents: []
          });
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to submit. Please try again.');
      console.error('Error submitting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {type === 'application' ? 'Apply for Property' : 'Express Interest'}
          </h2>
          <button className="close-btn" onClick={handleClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {success ? (
            <div className="success-state">
              <CheckCircle size={48} className="success-icon" />
              <h3>
                {type === 'application' ? 'Application Submitted!' : 'Interest Expressed!'}
              </h3>
              <p>
                {type === 'application' 
                  ? 'Your application has been submitted successfully. The landlord will review it and get back to you.'
                  : 'Your interest has been noted. The landlord will contact you if they are interested.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Property Info */}
              <div className="property-info">
                <h3>{property.title}</h3>
                <p>{property.address}, {property.city}</p>
                <p className="property-price">${property.rent?.toLocaleString()}/week</p>
              </div>

              {/* Existing Submission Warning */}
              {existingApplication && type === 'application' && (
                <div className="warning-banner">
                  <AlertCircle size={16} />
                  <span>You have already applied for this property on {new Date(existingApplication.createdAt?.toDate?.() || existingApplication.createdAt).toLocaleDateString()}</span>
                </div>
              )}

              {existingInterest && type === 'interest' && (
                <div className="warning-banner">
                  <AlertCircle size={16} />
                  <span>You have already expressed interest in this property on {new Date(existingInterest.createdAt?.toDate?.() || existingInterest.createdAt).toLocaleDateString()}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="error-banner">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Multi-Step Form */}
              <form onSubmit={handleSubmit} className="application-form">
                {/* Progress Indicator */}
                <div className="form-progress">
                  <div className="progress-steps">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''}`}>
                        <div className="step-number">{step}</div>
                        <div className="step-label">
                          {step === 1 && 'Personal'}
                          {step === 2 && 'Employment'}
                          {step === 3 && 'References'}
                          {step === 4 && 'Documents'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="form-step">
                    <h4>Personal Information</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="dateOfBirth">Date of Birth</label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <h5>Emergency Contact</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="emergencyName">Name</label>
                        <input
                          type="text"
                          id="emergencyName"
                          value={formData.emergencyContact.name}
                          onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="emergencyRelationship">Relationship</label>
                        <select
                          id="emergencyRelationship"
                          value={formData.emergencyContact.relationship}
                          onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                          required
                          disabled={loading}
                        >
                          <option value="">Select relationship</option>
                          <option value="parent">Parent</option>
                          <option value="sibling">Sibling</option>
                          <option value="spouse">Spouse</option>
                          <option value="friend">Friend</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="emergencyPhone">Phone Number</label>
                      <input
                        type="tel"
                        id="emergencyPhone"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Employment Information */}
                {currentStep === 2 && type === 'application' && (
                  <div className="form-step">
                    <h4>Employment Information</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="employment">Employment Status</label>
                        <select
                          id="employment"
                          name="employment"
                          value={formData.employment}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        >
                          <option value="">Select employment status</option>
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="self-employed">Self-employed</option>
                          <option value="student">Student</option>
                          <option value="unemployed">Unemployed</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="employmentType">Employment Type</label>
                        <select
                          id="employmentType"
                          name="employmentType"
                          value={formData.employmentType}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        >
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="contract">Contract</option>
                          <option value="casual">Casual</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="employer">Employer/Company</label>
                        <input
                          type="text"
                          id="employer"
                          name="employer"
                          value={formData.employer}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="jobTitle">Job Title</label>
                        <input
                          type="text"
                          id="jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="income">Annual Income ($)</label>
                        <input
                          type="number"
                          id="income"
                          name="income"
                          value={formData.income}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                          placeholder="e.g., 75000"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="employmentStartDate">Employment Start Date</label>
                        <input
                          type="date"
                          id="employmentStartDate"
                          name="employmentStartDate"
                          value={formData.employmentStartDate}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <h5>Rental Information</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="moveInDate">Preferred Move-in Date</label>
                        <input
                          type="date"
                          id="moveInDate"
                          name="moveInDate"
                          value={formData.moveInDate}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="leaseLength">Lease Length (months)</label>
                        <select
                          id="leaseLength"
                          name="leaseLength"
                          value={formData.leaseLength}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        >
                          <option value="6">6 months</option>
                          <option value="12">12 months</option>
                          <option value="18">18 months</option>
                          <option value="24">24 months</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="currentAddress">Current Address</label>
                      <input
                        type="text"
                        id="currentAddress"
                        name="currentAddress"
                        value={formData.currentAddress}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        placeholder="Full current address"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="currentLandlord">Current Landlord Name</label>
                        <input
                          type="text"
                          id="currentLandlord"
                          name="currentLandlord"
                          value={formData.currentLandlord}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="currentLandlordPhone">Current Landlord Phone</label>
                        <input
                          type="tel"
                          id="currentLandlordPhone"
                          name="currentLandlordPhone"
                          value={formData.currentLandlordPhone}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="reasonForMoving">Reason for Moving</label>
                      <textarea
                        id="reasonForMoving"
                        name="reasonForMoving"
                        value={formData.reasonForMoving}
                        onChange={handleInputChange}
                        disabled={loading}
                        placeholder="Please explain why you're looking for a new place..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: References */}
                {currentStep === 3 && type === 'application' && (
                  <div className="form-step">
                    <h4>References</h4>
                    <p>Please provide at least 2 references who can vouch for your character and reliability.</p>
                    
                    {formData.references.map((reference, index) => (
                      <div key={index} className="reference-section">
                        <div className="reference-header">
                          <h5>Reference {index + 1}</h5>
                          {formData.references.length > 2 && (
                            <button
                              type="button"
                              className="remove-reference-btn"
                              onClick={() => removeReference(index)}
                              disabled={loading}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor={`refName${index}`}>Name</label>
                            <input
                              type="text"
                              id={`refName${index}`}
                              value={reference.name}
                              onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`refRelationship${index}`}>Relationship</label>
                            <select
                              id={`refRelationship${index}`}
                              value={reference.relationship}
                              onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                              required
                              disabled={loading}
                            >
                              <option value="">Select relationship</option>
                              <option value="previous-landlord">Previous Landlord</option>
                              <option value="employer">Employer</option>
                              <option value="colleague">Colleague</option>
                              <option value="friend">Friend</option>
                              <option value="family">Family</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor={`refPhone${index}`}>Phone Number</label>
                            <input
                              type="tel"
                              id={`refPhone${index}`}
                              value={reference.phone}
                              onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`refEmail${index}`}>Email Address</label>
                            <input
                              type="email"
                              id={`refEmail${index}`}
                              value={reference.email}
                              onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="add-reference-btn"
                      onClick={addReference}
                      disabled={loading || formData.references.length >= 5}
                    >
                      <Plus size={16} />
                      Add Reference
                    </button>
                  </div>
                )}

                {/* Step 4: Documents and Additional Info */}
                {currentStep === 4 && (
                  <div className="form-step">
                    <h4>Documents & Additional Information</h4>
                    
                    {type === 'application' && (
                      <>
                        <div className="form-group">
                          <label>Upload Documents</label>
                          <div className="document-upload">
                            <input
                              type="file"
                              id="documentUpload"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={handleDocumentUpload}
                              disabled={loading || uploadingDocuments}
                              style={{ display: 'none' }}
                            />
                            <label htmlFor="documentUpload" className="upload-btn">
                              <Upload size={16} />
                              {uploadingDocuments ? 'Uploading...' : 'Upload Documents'}
                            </label>
                            <p className="upload-hint">Upload ID, income statements, references, etc. (PDF, JPG, PNG, DOC)</p>
                          </div>
                        </div>

                        {formData.documents.length > 0 && (
                          <div className="uploaded-documents">
                            <h5>Uploaded Documents</h5>
                            {formData.documents.map((doc, index) => (
                              <div key={index} className="document-item">
                                <FileImage size={16} />
                                <span className="document-name">{doc.name}</span>
                                <span className="document-size">({(doc.size / 1024).toFixed(1)} KB)</span>
                                <button
                                  type="button"
                                  className="remove-document-btn"
                                  onClick={() => removeDocument(index)}
                                  disabled={loading}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="pets">Pets</label>
                            <select
                              id="pets"
                              name="pets"
                              value={formData.pets}
                              onChange={handleInputChange}
                              disabled={loading}
                            >
                              <option value="none">No pets</option>
                              <option value="cat">Cat(s)</option>
                              <option value="dog">Dog(s)</option>
                              <option value="other">Other pets</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label htmlFor="smoking">Smoking</label>
                            <select
                              id="smoking"
                              name="smoking"
                              value={formData.smoking}
                              onChange={handleInputChange}
                              disabled={loading}
                            >
                              <option value="non-smoker">Non-smoker</option>
                              <option value="smoker">Smoker</option>
                              <option value="occasional">Occasional smoker</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="additionalInfo">Additional Information</label>
                          <textarea
                            id="additionalInfo"
                            name="additionalInfo"
                            value={formData.additionalInfo}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="Any additional information you'd like the landlord to know..."
                            rows={4}
                          />
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label htmlFor="message">
                        {type === 'application' 
                          ? 'Message to Landlord (optional)'
                          : 'Why are you interested in this property?'
                        }
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        disabled={loading}
                        placeholder={
                          type === 'application'
                            ? 'Tell the landlord why you would be a great tenant...'
                            : 'Share what you like about this property...'
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {/* Form Navigation */}
                <div className="form-navigation">
                  <div className="nav-buttons">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="nav-btn prev-btn"
                        onClick={prevStep}
                        disabled={loading}
                      >
                        Previous
                      </button>
                    )}
                    
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        className="nav-btn next-btn"
                        onClick={nextStep}
                        disabled={loading}
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading || (type === 'application' && existingApplication) || (type === 'interest' && existingInterest)}
                      >
                        {loading ? (
                          <>
                            <div className="spinner"></div>
                            {type === 'application' ? 'Submitting...' : 'Sending...'}
                          </>
                        ) : (
                          <>
                            <FileText size={16} />
                            {type === 'application' ? 'Submit Application' : 'Express Interest'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;

