import React, { useState } from 'react';
import { ethers } from 'ethers';
import { QRCodeCanvas } from 'qrcode.react';import contractABI from '../../../server/artifacts/contracts/InstituteRegistration.sol/InstituteRegistration.json';
import { useRef } from 'react';
import "../style/issue.css"
const verifyBaseUrl = import.meta.env.VITE_VERIFY_URL || 'http://localhost:5173/verify';
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const Issue = () => {
  const [formData, setFormData] = useState({
    instituteName: '',
    department: '',
    firstName: '',
    lastName: '',
    certificantId: '',
    email: '',
    courseCompleted: '',
    completionDate: '',
    notes: '',
    ipfsHash: ''
  });

  const [status, setStatus] = useState('');
  const [certHash, setCertHash] = useState('');
  const [transactionComplete, setTransactionComplete] = useState(false);
  const qrCodeRef = useRef(null);
  const [customMessage, setCustomMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Processing transaction...');
    setTransactionComplete(false);
    setCertHash('');

    if (!window.ethereum) {
      setStatus('Metamask not detected. Please install Metamask.');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

      const tx = await contract.issueCertificate(
        formData.instituteName,
        formData.department,
        formData.firstName,
        formData.lastName,
        formData.certificantId,
        formData.email,
        formData.courseCompleted,
        Math.floor(new Date(formData.completionDate).getTime() / 1000),
        formData.notes,
        formData.ipfsHash
      );

      setStatus('Transaction sent. Waiting for confirmation...');
      const receipt = await tx.wait();
      const hash = receipt.logs[0].topics[1];
      setCertHash(hash);
      setTransactionComplete(true);
      setStatus(`Certificate issued successfully! Certificate Hash: ${hash}`);
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setFormData({
      instituteName: '',
      department: '',
      firstName: '',
      lastName: '',
      certificantId: '',
      email: '',
      courseCompleted: '',
      completionDate: '',
      notes: '',
      ipfsHash: ''
    });
    setStatus('');
    setCertHash('');
    setTransactionComplete(false);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('certificate-qr-code');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `certificate-${formData.certificantId}-verification-qr.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const verificationUrl = certHash ? `${verifyBaseUrl}?hash=${certHash}` : '';

  const sendEmail = async () => {
    setStatus('Sending email...');
    const canvas = document.getElementById('certificate-qr-code');
    const qrCodeImage = canvas ? canvas.toDataURL('image/png') : '';
    const emailData = {
      recipientEmail: formData.email,
      studentName: `${formData.firstName} ${formData.lastName}`,
      courseName: formData.courseCompleted,
      instituteName: formData.instituteName,
      department: formData.department,
      completionDate: formData.completionDate,
      certificateHash: certHash,
      verificationUrl: `${verifyBaseUrl}?hash=${certHash}`,
      qrCodeImage,
      additionalMessage: customMessage.trim() ? customMessage : null
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        setStatus('Email sent successfully!');
        setEmailSent(true);
      } else {
        setStatus('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      setStatus('Error sending email.');
    }
  };
  

  return (
    <>
      <div className="certificate-issue-container">
        <form onSubmit={handleSubmit} className="certificate-form">
          {/* Institute Details Section */}
          <div className="form-section">
            <h2 className="form-section-title">Institute Details</h2>
            
            <div className="form-group">
              <label className="form-label" htmlFor="instituteName">Institute Name</label>
              <input
                className="form-input"
                type="text"
                id="instituteName"
                name="instituteName"
                value={formData.instituteName}
                onChange={handleChange}
                placeholder="Enter institute name"
                required
              />
            </div>
  
            <div className="form-group">
              <label className="form-label" htmlFor="department">Department</label>
              <input
                className="form-input"
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter department name"
              />
            </div>
          </div>
  
          {/* Certificant Details Section */}
          <div className="form-section">
            <h2 className="form-section-title">Certificant Details</h2>
            
            <div className="name-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="firstName">First Name *</label>
                <input
                  className="form-input"
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
              </div>
  
              <div className="form-group">
                <label className="form-label" htmlFor="lastName">Last Name *</label>
                <input
                  className="form-input"
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
  
            <div className="form-group">
              <label className="form-label" htmlFor="certificantId">Certificant ID *</label>
              <input
                className="form-input"
                type="text"
                id="certificantId"
                name="certificantId"
                value={formData.certificantId}
                onChange={handleChange}
                placeholder="Enter certificant ID"
                required
              />
            </div>
  
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address *</label>
              <input
                className="form-input"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>
  
            <div className="form-group">
              <label className="form-label" htmlFor="courseCompleted">Course Completed *</label>
              <input
                className="form-input"
                type="text"
                id="courseCompleted"
                name="courseCompleted"
                value={formData.courseCompleted}
                onChange={handleChange}
                placeholder="Enter course name"
                required
              />
            </div>
  
            <div className="form-group">
              <label className="form-label" htmlFor="completionDate">Completion Date *</label>
              <input
                className="form-input"
                type="date"
                id="completionDate"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
  
          {/* Additional Notes */}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label" htmlFor="notes">Additional Notes</label>
              <textarea
                className="form-input"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information..."
                rows="4"
              />
            </div>
          </div>
  
          {/* QR Code Section */}
          {transactionComplete && certHash && (
            <div className="qr-code-section" ref={qrCodeRef}>
              <h3 className="qr-code-title">Certificate Verification QR Code</h3>
              <p>Scan this QR code to verify the certificate</p>
              
              <QRCodeCanvas
                id="certificate-qr-code"
                value={verificationUrl}
                size={200}
                level="H"
              />
              
              <button
                type="button"
                onClick={downloadQRCode}
                className="btn-download-qr"
              >
                Download QR Code
              </button>
              
              <p style={{fontSize: '0.75rem', color: 'var(--light-text-secondary)'}}>
                Certificate Hash: {certHash}
              </p>
            </div>
          )}
  
          {/* Status Message */}
          {status && (
            <div className="status-message">
              {status}
            </div>
          )}
  
          {/* Buttons */}
          <div className="form-buttons">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
            >
              Issue Certificate
            </button>
          </div>
  
          {/* Email Sending Section */}
          {transactionComplete && !emailSent && (
            <div className="form-section">
              <h3 className="form-section-title">Send Certificate to Recipient</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="customMessage">Custom Message (Optional)</label>
                <textarea
                  className="form-input"
                  id="customMessage"
                  placeholder="Add a message to include in the email..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows="4"
                />
              </div>
              
              <div className="form-buttons">
                <button
                  type="button"
                  onClick={sendEmail}
                  className="btn-submit"
                >
                  Send Email to Recipient
                </button>
              </div>
            </div>
          )}
  
          {/* Email Sent Confirmation */}
          {emailSent && (
            <div className="status-message">
              Email sent successfully to {formData.email}
            </div>
          )}
        </form>
      </div>
      <div className="decoration decoration-1"></div>
      <div className="decoration decoration-2"></div>
      <div className="decoration decoration"></div>
      </>
    );
};

export default Issue;