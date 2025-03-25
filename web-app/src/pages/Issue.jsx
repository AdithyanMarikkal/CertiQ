import React, { useState } from 'react';
import { ethers } from 'ethers';
import { QRCodeCanvas } from 'qrcode.react';import contractABI from '../../../server/artifacts/contracts/InstituteRegistration.sol/InstituteRegistration.json';
import { useRef } from 'react';
const verifyBaseUrl = import.meta.env.VITE_VERIFY_URL || 'http://localhost:5173/verify';
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const styles = {
  container: {
    minHeight: '100vh',
    backgroundImage: 'url("../assets/back.jpeg")', // Ensure correct path
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed', // Keeps the background fixed while scrolling
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
    
  },
  formWrapper: {
    maxWidth: '700px',
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // More transparency
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', // Deeper shadow for contrast
    padding: '16px',
    backdropFilter: 'blur(12px)', // Stronger blur effect
    maxHeight: '85vh', // Limit form height
    overflowY: 'auto'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e5e5e5'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#666',
    fontSize: '14px'
  },
  form: {
    padding: '24px'
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e5e5'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  nameGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  cancelButton: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    color: '#333'
  },
  submitButton: {
    backgroundColor: '#2563eb',
    border: 'none',
    color: 'white'
  },
  qrCodeContainer: {
    marginTop: '24px',
    padding: '16px',
    border: '1px solid #e5e5e5', 
    borderRadius: '8px',
    backgroundColor: 'white',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  qrCodeTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  },
  downloadButton: {
    backgroundColor: '#10b981',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  // New email section styles
  emailSection: {
    marginTop: '24px',
    padding: '16px',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    backgroundColor: 'white'
  },
  emailSectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px'
  },
  sendEmailButton: {
    backgroundColor: '#10b981',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  successMessage: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#ecfdf5',
    borderRadius: '4px',
    color: '#065f46',
    fontWeight: '500'
  }
};

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
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Certificate Issue Request</h1>
          <p style={styles.subtitle}>Please fill in the details to request a new certificate</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Institute Details Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Institute Details</h2>
            <input type="text" name="instituteName" value={formData.instituteName} onChange={handleChange} placeholder="Institute Name" required />
            
            

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="department">
                Department
              </label>
              <input
                style={styles.input}
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
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Certificant Details</h2>
            
            <div style={styles.nameGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="firstName">
                  First Name *
                </label>
                <input
                  style={styles.input}
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="lastName">
                  Last Name *
                </label>
                <input
                  style={styles.input}
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="certificantId">
                Certificant ID *
              </label>
              <input
                style={styles.input}
                type="text"
                id="certificantId"
                name="certificantId"
                value={formData.certificantId}
                onChange={handleChange}
                required
                placeholder="Enter certificant ID"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">
                Email Address *
              </label>
              <input
                style={styles.input}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="courseCompleted">
                Course Completed *
              </label>
              <input
                style={styles.input}
                type="text"
                id="courseCompleted"
                name="courseCompleted"
                value={formData.courseCompleted}
                onChange={handleChange}
                required
                placeholder="Enter course name"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="completionDate">
                Completion Date *
              </label>
              <input
                style={styles.input}
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
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="notes">
              Additional Notes
            </label>
            <textarea
              style={styles.textarea}
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information..."
            />
          </div>

          {/* QR Code section - only shown after successful transaction */}
          {transactionComplete && certHash && (
            <div style={styles.qrCodeContainer}>
              <h3 style={styles.qrCodeTitle}>Certificate Verification QR Code</h3>
              <p>Scan this QR code to verify the certificate</p>
              
              <QRCodeCanvas
                id="certificate-qr-code"
                value={verificationUrl}
                size={200}
                level="H"
                ref={qrCodeRef}
              />
              
              <button
                type="button"
                onClick={downloadQRCode}
                style={styles.downloadButton}
              >
                Download QR Code
              </button>
              
              <p style={{fontSize: '12px', color: '#666'}}>
                Certificate Hash: {certHash}
              </p>
            </div>
          )}

          {/* Status message */}
          {status && (
            <div style={{marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px'}}>
              <p style={{margin: 0}}>{status}</p>
            </div>
          )}

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleCancel}
              style={{...styles.button, ...styles.cancelButton}}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{...styles.button, ...styles.submitButton}}
            >
              Issue certificate
            </button>
          </div>
          {/* {status && <p>{status}</p>} */}
        </form>
        <div>
          {/* Email sending section */}
          {transactionComplete && !emailSent && (
            <div style={styles.emailSection}>
              <h3 style={styles.emailSectionTitle}>
                Send Certificate to Recipient
              </h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="customMessage">
                  Custom Message (Optional)
                </label>
                <textarea
                  style={styles.textarea}
                  id="customMessage"
                  placeholder="Add a message to include in the email..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>
              
              <button
                type="button"
                onClick={sendEmail}
                style={styles.sendEmailButton}
              >
                Send Email to Recipient
              </button>
            </div>
          )}

          {emailSent && (
            <div style={styles.successMessage}>
              <p style={{margin: 0}}>Email sent successfully to {formData.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Issue;