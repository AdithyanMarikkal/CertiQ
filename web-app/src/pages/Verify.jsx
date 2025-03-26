import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import InstituteRegistration from '../../../server/artifacts/contracts/InstituteRegistration.sol/InstituteRegistration.json';
import { useSearchParams } from "react-router-dom";
import axios from 'axios'; 
import '../style/verify.css';
const API_URL =import.meta.env.VITE_GETABI || "http://localhost:5000/api/abi";


async function fetchABI() {
  try {
      const response = await fetch(API_URL);
      return await response.json();
  } catch (error) {
      console.error("Error fetching ABI:", error);
      return null;
  }
}
const contractABI = await fetchABI();
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const VerifyCertificate = () => {
  const [searchParams] = useSearchParams();
  const paramValue = searchParams.get("hash"); // Get 'hash' from URL
  const [certHash, setCertHash] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectedAccount, setConnectedAccount] = useState('');
  const [isIssuer, setIsIssuer] = useState(false);
  
  // Combined states for management section
  const [activeTab, setActiveTab] = useState('certificate'); // 'certificate' or 'manage'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');
  const [newIpfsHash, setNewIpfsHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
    
    // Setup listeners for wallet connections/disconnections
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (paramValue) {
      setCertHash(paramValue);
    }
  }, [paramValue]);

  // Check if the connected wallet is the certificate issuer whenever the certificate or connected account changes
  useEffect(() => {
    if (certificate && connectedAccount) {
      checkIssuerStatus();
    } else {
      setIsIssuer(false);
    }
  }, [certificate, connectedAccount]);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setConnectedAccount(accounts[0]);
    } else {
      setConnectedAccount('');
    }
  };

  const checkWalletConnection = async () => {
    if (!window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setConnectedAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };
  
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to connect your wallet");
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setConnectedAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };
  
  const checkIssuerStatus = async () => {
    if (!certHash || !connectedAccount) return;

    try {
      const provider = getProvider();
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // Access the certificate directly using the certificates mapping
      const certData = await contract.certificates(certHash);
      
      // Check if the connected wallet is the issuer
      setIsIssuer(certData[11] && certData[11].toLowerCase() === connectedAccount.toLowerCase());
    } catch (error) {
      console.error("Error checking issuer status:", error);
      setIsIssuer(false);
    }
  };

  const getProvider = () => {
    // For read-only operations, use a JsonRpcProvider
    const network = import.meta.env.REACT_APP_ALCHEMY_URL || "https://rpc-amoy.polygon.technology";
    try{
      return new ethers.JsonRpcProvider(network);
    }
    catch(error){
      console.error("Error creating provider:", error);
      // Fallback to public RPC if your Alchemy URL fails
      return new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology")
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setCertificate(null);
    setIsIssuer(false);

    try {
      if (!certHash) {
        throw new Error('Please enter a certificate key');
      }

      const provider = getProvider();
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      // Using the verifyCertificate function from your contract
      const certificateData = await contract.verifyCertificate(certHash);
      
      // Check if the certificate exists (validate that instituteName is not empty)
      if (!certificateData || !certificateData[1]) {
        throw new Error('Certificate not found');
      }

      // Format the certificate data based on the return values from verifyCertificate
      const formattedCertificate = {
        isValid: certificateData[0],
        instituteName: certificateData[1],
        department: certificateData[2],
        firstName: certificateData[3],
        lastName: certificateData[4],
        certificantId: certificateData[5],
        email: certificateData[6],
        courseCompleted: certificateData[7],
        completionDate: new Date(Number(certificateData[8]) * 1000).toLocaleDateString(),
        notes: certificateData[9],
        ipfsHash: certificateData[10]
      };

      setCertificate(formattedCertificate);
      
      // If a wallet is connected, check if it's the issuer
      if (connectedAccount) {
        checkIssuerStatus();
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setError(error.message || 'Failed to verify certificate. Please check the certificate key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeCertificate = async () => {
    if (!window.ethereum) {
      alert("Please connect to MetaMask");
      return;
    }
    
    if (!isIssuer) {
      alert("Only the certificate issuer can revoke this certificate");
      return;
    }
    
    if (!confirm("Are you sure you want to revoke this certificate? This action cannot be undone.")) {
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const tx = await contract.revokeCertificate(certHash);
      await tx.wait();
      
      setSuccess(`Certificate has been successfully revoked.`);
      
      // Refresh certificate data to show the updated status
      const updatedCertificateData = await contract.verifyCertificate(certHash);
      const updatedCertificate = {
        ...certificate,
        isValid: updatedCertificateData[0]
      };
      
      setCertificate(updatedCertificate);
    } catch (error) {
      console.error("Error revoking certificate:", error);
      setError("Failed to revoke certificate. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // File handling functions
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setIpfsHash('');
  };

  // Unified function for certificate management
  const handleCertificateManagement = async (action) => {
    if (!window.ethereum) {
      alert("Please connect to MetaMask");
      return;
    }
    
    if (!isIssuer) {
      alert("Only the certificate issuer can manage this certificate");
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      if (action === 'upload' && selectedFile) {
        // Upload file to IPFS and update blockchain
        setUploadProgress(10);
        
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => prev < 90 ? prev + 10 : prev);
        }, 500);
        
        // Upload to IPFS
        const response = await axios.post(`${SERVER_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (!response.data || !response.data.hash) {
          throw new Error('Failed to retrieve IPFS hash from server');
        }
        
        const newHash = response.data.hash;
        setIpfsHash(newHash);
        
        // Update blockchain with the new hash
        setSuccess('Updating blockchain with new certificate...');
        const tx = await contract.updateIpfsHash(certHash, newHash);
        await tx.wait();
        
        setSuccess('Certificate successfully uploaded and linked!');
        
        // Refresh certificate data
        const updatedCertificateData = await contract.verifyCertificate(certHash);
        const updatedCertificate = {
          ...certificate,
          ipfsHash: updatedCertificateData[10]
        };
        
        setCertificate(updatedCertificate);
      } else if (action === 'update' && newIpfsHash) {
        // Update IPFS hash only
        setSuccess('Updating certificate reference...');
        const tx = await contract.updateIpfsHash(certHash, newIpfsHash);
        await tx.wait();
        
        setSuccess('Certificate reference successfully updated!');
        
        // Refresh certificate data
        const updatedCertificateData = await contract.verifyCertificate(certHash);
        const updatedCertificate = {
          ...certificate,
          ipfsHash: updatedCertificateData[10]
        };
        
        setCertificate(updatedCertificate);
        setNewIpfsHash('');
      } else {
        throw new Error('Invalid action or missing data');
      }
    } catch (error) {
      console.error('Error managing certificate:', error);
      setError(`Operation failed: ${error.message}`);
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy to clipboard utility
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSuccess('Copied to clipboard!');
        setTimeout(() => setSuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setError('Failed to copy to clipboard');
      });
  };

  return (
    <div className="verify-container">
      <div className="decoration decoration-1"></div>
      <div className="decoration decoration-2"></div>
      
      <div className="verification-wrapper container">
        <div className="verification-card card">
          <div className="card-header">
            <h1 className="card-title">Certificate Verification</h1>
            <p className="card-subtitle">Validate the authenticity of your digital certificate</p>
          </div>
          
          <div className="card-body">
            {/* Wallet connection section */}
            <div className="wallet-status">
              {connectedAccount ? (
                <div className="connected-wallet">
                  <span>Connected: {`${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`}</span>
                </div>
              ) : (
                <div className="connect-wallet">
                  <button onClick={connectWallet} className="button btn-outline">
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleVerify} className="verification-form">
              <div className="form-group">
                <label htmlFor="certHash" className="form-label">
                  Certificate Key
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="certHash"
                  value={certHash}
                  onChange={(e) => setCertHash(e.target.value)}
                  placeholder="Enter certificate key (certHash)"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="button btn-primary verification-submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Verify Certificate'}
              </button>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
            </form>

            {isLoading && (
              <div className="loading-spinner">
                <p>Loading certificate information...</p>
              </div>
            )}

            {certificate && (
              <>
                {/* Tabs navigation for certificate display and management */}
                {isIssuer && certificate.isValid && (
                  <div className="certificate-tabs">
                    <button 
                      className={`tab ${activeTab === 'certificate' ? 'active' : ''}`}
                      onClick={() => setActiveTab('certificate')}
                    >
                      Certificate Details
                    </button>
                    <button 
                      className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
                      onClick={() => setActiveTab('manage')}
                    >
                      Manage Certificate
                    </button>
                  </div>
                )}
                
                {/* Certificate details view */}
                {(activeTab === 'certificate' || !isIssuer) && (
                  <div className="certificate-display">
                    <h2 className="certificate-title">
                      Certificate 
                      {certificate.isValid ? 
                        <span className="valid-badge">VALID</span> : 
                        <span className="revoked-badge">REVOKED</span>
                      }
                    </h2>

                    <div className="certificate-details">
                      <div className="certificate-field">
                        <span className="field-label">Institution:</span>
                        <span className="field-value">{certificate.instituteName}</span>
                      </div>

                      <div className="certificate-field">
                        <span className="field-label">Department:</span>
                        <span className="field-value">{certificate.department}</span>
                      </div>

                      <div className="certificate-field">
                        <span className="field-label">Recipient:</span>
                        <span className="field-value">{certificate.firstName} {certificate.lastName}</span>
                      </div>

                      <div className="certificate-field">
                        <span className="field-label">ID:</span>
                        <span className="field-value">{certificate.certificantId}</span>
                      </div>

                      <div className="certificate-field">
                        <span className="field-label">Email:</span>
                        <span className="field-value">{certificate.email}</span>
                      </div>

                      <div className="certificate-field">
                        <span className="field-label">Course:</span>
                        <span className="field-value">{certificate.courseCompleted}</span>
                      </div>

                      <div className="certificate-field">
                        <span className="field-label">Completion Date:</span>
                        <span className="field-value">{certificate.completionDate}</span>
                      </div>

                      {certificate.notes && (
                        <div className="certificate-field">
                          <span className="field-label">Notes:</span>
                          <span className="field-value">{certificate.notes}</span>
                        </div>
                      )}

                      {certificate.ipfsHash && certificate.ipfsHash !== "N/A" && (
                        <div className="certificate-field">
                          <span className="field-label">View Certificate:</span>
                          <a 
                            href={`https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ipfs-link"
                          >
                            Download
                          </a>
                        </div>
                      )}
                      
                      {isIssuer && certificate.isValid && (
                        <button 
                          onClick={handleRevokeCertificate} 
                          className="button btn-outline revoke-button"
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : 'Revoke Certificate'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Certificate management view */}
                {activeTab === 'manage' && isIssuer && certificate.isValid && (
                  <div className="certificate-management">
                    <h3 className="section-title">Certificate Management</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Upload New Certificate</label>
                      <input
                        type="file"
                        id="certificateFile"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      <label htmlFor="certificateFile" className="file-input-label">
                        {selectedFile ? selectedFile.name : "Click to select a file"}
                      </label>
                      
                      {selectedFile && (
                        <div className="selected-file">
                          <span>{selectedFile.name}</span>
                          <button 
                            type="button" 
                            onClick={clearSelectedFile} 
                            className="clear-file-btn"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      
                      {isUploading && (
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{
                              width: `${uploadProgress}%`
                            }}
                          />
                        </div>
                      )}
                      
                      <button 
                        onClick={() => handleCertificateManagement('upload')} 
                        className="button btn-primary action-btn"
                        disabled={!selectedFile || isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Upload & Update Certificate'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyCertificate;