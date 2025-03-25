import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import InstituteRegistration from '../../../server/artifacts/contracts/InstituteRegistration.sol/InstituteRegistration.json';
import { useSearchParams } from "react-router-dom";
import axios from 'axios'; 

const styles = {
  container: {
    minHeight: '100vh',
    backgroundImage: 'url("../assets/back.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  verificationWrapper: {
    maxWidth: '700px',
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    padding: '16px',
    backdropFilter: 'blur(12px)',
    maxHeight: '85vh',
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
  button: {
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#2563eb',
    border: 'none',
    color: 'white',
    marginTop: '16px',
    width: '100%'
  },
  revokeButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#DC2626',
    border: 'none',
    color: 'white',
    marginTop: '16px',
    width: '100%'
  },
  actionButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#8B5CF6',
    border: 'none',
    color: 'white',
    marginTop: '16px',
    width: '100%'
  },
  connectButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#047857',
    border: 'none',
    color: 'white',
    marginTop: '16px',
    width: '100%'
  },
  fileInput: {
    display: 'none'
  },
  fileInputLabel: {
    display: 'block',
    padding: '8px 12px',
    border: '1px dashed #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
    marginTop: '8px'
  },
  selectedFile: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: '#f0f9ff',
    borderRadius: '4px',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  clearFileBtn: {
    background: 'none',
    border: 'none',
    color: '#DC2626',
    cursor: 'pointer',
    fontSize: '16px'
  },
  divider: {
    margin: '24px 0',
    borderTop: '1px solid #ddd'
  },
  managementSection: {
    padding: '16px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '4px',
    marginTop: '16px',
    border: '1px solid #d1d5db'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px'
  },
  sectionDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    marginTop: '8px',
    position: 'relative',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    transition: 'width 0.3s'
  },
  ipfsResult: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  ipfsLink: {
    color: '#2563eb',
    textDecoration: 'none',
    wordBreak: 'break-all'
  },
  certificateDisplay: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  certificateTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
    textAlign: 'center'
  },
  certificateField: {
    marginBottom: '12px',
    padding: '8px',
    borderBottom: '1px solid #eee'
  },
  fieldLabel: {
    fontWeight: '500',
    color: '#666',
    marginRight: '8px',
    display: 'inline-block',
    width: '140px'
  },
  fieldValue: {
    color: '#333',
    fontWeight: '400'
  },
  validBadge: {
    backgroundColor: '#10B981',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginLeft: '8px'
  },
  revokedBadge: {
    backgroundColor: '#EF4444',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginLeft: '8px'
  },
  loadingSpinner: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px'
  },
  errorMessage: {
    color: '#EF4444',
    marginTop: '16px',
    padding: '8px',
    backgroundColor: '#FEE2E2',
    borderRadius: '4px'
  },
  successMessage: {
    color: '#047857',
    marginTop: '16px',
    padding: '8px',
    backgroundColor: '#D1FAE5',
    borderRadius: '4px'
  },
  walletStatus: {
    padding: '8px 16px',
    margin: '0 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '4px',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  copyButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    marginLeft: '8px',
    fontSize: '14px'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    margin: '0 24px 16px 24px'
  },
  tab: {
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
  },
  activeTab: {
    borderBottom: '2px solid #2563eb',
    color: '#2563eb',
    fontWeight: '500'
  }
};

const contractABI = InstituteRegistration.abi;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

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
    <div style={styles.container}>
      <div style={styles.verificationWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Certificate Verification</h1>
          <p style={styles.subtitle}>Enter the certificate key to verify authenticity</p>
        </div>

        {/* Wallet connection section */}
        <div style={styles.walletStatus}>
          {connectedAccount ? (
            <div>
              <span>Connected: {`${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`}</span>
            </div>
          ) : (
            <div>
              <button onClick={connectWallet} style={styles.connectButton}>
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleVerify} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="certHash">
              Certificate Key
            </label>
            <input
              style={styles.input}
              type="text"
              id="certHash"
              value={certHash}
              onChange={(e) => setCertHash(e.target.value)}
              placeholder="Enter certificate key (certHash)"
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Verify Certificate'}
          </button>

          {error && <div style={styles.errorMessage}>{error}</div>}
          {success && <div style={styles.successMessage}>{success}</div>}
        </form>

        {isLoading && (
          <div style={styles.loadingSpinner}>
            <p>Loading certificate information...</p>
          </div>
        )}

        {certificate && (
          <>
            {/* Tabs navigation for certificate display and management */}
            {isIssuer && certificate.isValid && (
              <div style={styles.tabs}>
                <button 
                  style={activeTab === 'certificate' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                  onClick={() => setActiveTab('certificate')}
                >
                  Certificate Details
                </button>
                <button 
                  style={activeTab === 'manage' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                  onClick={() => setActiveTab('manage')}
                >
                  Manage Certificate
                </button>
              </div>
            )}
            
            {/* Certificate details view */}
            {(activeTab === 'certificate' || !isIssuer) && (
              <div style={styles.certificateDisplay}>
                <h2 style={styles.certificateTitle}>
                  Certificate 
                  {certificate.isValid ? 
                    <span style={styles.validBadge}>VALID</span> : 
                    <span style={styles.revokedBadge}>REVOKED</span>
                  }
                </h2>

                <div style={styles.certificateField}>
                  <span style={styles.fieldLabel}>Institution:</span>
                  <span style={styles.fieldValue}>{certificate.instituteName}</span>
                </div>

                <div style={styles.certificateField}>
                  <span style={styles.fieldLabel}>Department:</span>
                  <span style={styles.fieldValue}>{certificate.department}</span>
                </div>

                <div style={styles.certificateField}>
                  <span style={styles.fieldLabel}>Recipient:</span>
                  <span style={styles.fieldValue}>{certificate.firstName} {certificate.lastName}</span>
                </div>

                <div style={styles.certificateField}>
                  <span style={styles.fieldLabel}>ID:</span>
                  <span style={styles.fieldValue}>{certificate.certificantId}</span>
                </div>

                <div style={styles.certificateField}>
                  <span style={styles.fieldLabel}>Email:</span>
                  <span style={styles.fieldValue}>{certificate.email}</span>
                </div>

                <div style={styles.certificateField}>
                  <span style={styles.fieldLabel}>Course:</span>
                  <span style={styles.fieldValue}>{certificate.courseCompleted}</span>
                </div>

                <div style={styles.certificateField}>
                  <span style={styles.fieldLabel}>Completion Date:</span>
                  <span style={styles.fieldValue}>{certificate.completionDate}</span>
                </div>

                {certificate.notes && (
                  <div style={styles.certificateField}>
                    <span style={styles.fieldLabel}>Notes:</span>
                    <span style={styles.fieldValue}>{certificate.notes}</span>
                  </div>
                )}

                {/* View certificate on IPFS if hash is available */}
                {certificate.ipfsHash && certificate.ipfsHash !== "N/A" && (
                  <div style={styles.certificateField}>
                    <span style={styles.fieldLabel}>View Certificate:</span>
                    <a 
                      href={`https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.ipfsLink}
                    >
                      Download
                    </a>
                  </div>
                )}
                
                {/* Revoke button - always visible if issuer and certificate is valid */}
                {isIssuer && certificate.isValid && (
                  <button 
                    onClick={handleRevokeCertificate} 
                    style={styles.revokeButton}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Revoke Certificate'}
                  </button>
                )}
              </div>
            )}
            
            {/* Certificate management view */}
            {activeTab === 'manage' && isIssuer && certificate.isValid && (
              <div style={styles.managementSection}>
                <h3 style={styles.sectionTitle}>Certificate Management</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Upload New Certificate</label>
                  <input
                    type="file"
                    id="certificateFile"
                    onChange={handleFileChange}
                    style={styles.fileInput}
                  />
                  <label htmlFor="certificateFile" style={styles.fileInputLabel}>
                    {selectedFile ? selectedFile.name : "Click to select a file"}
                  </label>
                  
                  {selectedFile && (
                    <div style={styles.selectedFile}>
                      <span>{selectedFile.name}</span>
                      <button 
                        type="button" 
                        onClick={clearSelectedFile} 
                        style={styles.clearFileBtn}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div style={styles.progressBar}>
                      <div 
                        style={{
                          ...styles.progressFill,
                          width: `${uploadProgress}%`
                        }}
                      />
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleCertificateManagement('upload')} 
                    style={styles.actionButton}
                    disabled={!selectedFile || isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Upload & Update Certificate'}
                  </button>
                </div>
                
                <div style={styles.divider}></div>
                
                {/* <div style={styles.formGroup}>
                  <label style={styles.label}>Manual IPFS Update</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={newIpfsHash}
                    onChange={(e) => setNewIpfsHash(e.target.value)}
                    placeholder="Enter IPFS hash"
                  />
                  
                  {ipfsHash && (
                    <button 
                      onClick={() => setNewIpfsHash(ipfsHash)} 
                      style={{...styles.actionButton, marginTop: '8px'}}
                      disabled={isProcessing}
                    >
                      Use Uploaded Hash
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleCertificateManagement('update')} 
                    style={styles.actionButton}
                    disabled={!newIpfsHash || isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Update Certificate Reference'}
                  </button> */}
                {/* </div> */}
                
                {/* {ipfsHash && (
                  <div style={styles.ipfsResult}>
                    <p>Latest Upload: 
                      <a 
                        href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.ipfsLink}
                      >
                        {ipfsHash}
                      </a>
                      <button 
                        onClick={() => copyToClipboard(ipfsHash)} 
                        style={styles.copyButton}
                      >
                        Copy
                      </button>
                    </p>
                  </div>
                )} */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;