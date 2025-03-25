import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import './CenteredBox.css';

const contractABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_institute", "type": "address" }],
    "name": "isRegistered",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const CenteredBox = () => {
  const [account, setAccount] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking MetaMask accounts:", error);
        }
      }
    };
    checkWallet();
  }, []);

  useEffect(() => {
    if (account) {
      checkRegistration(account);
    }
  }, [account]);

  const checkRegistration = async (walletAddress) => {
    if (!contractAddress) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const registered = await contract.isRegistered(walletAddress);
      setIsRegistered(registered);
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const handleIssueClick = () => {
    if (!account) {
      alert("Please connect your wallet to issue a certificate.");
      return;
    } 
    if (isRegistered) {
      navigate("/issue");
    } else {
      alert("Please register your institute before issuing a certificate.");
    }
  };

  return (
    <>
      <div className="decoration decoration-1"></div>
      <div className="decoration decoration-2"></div>
      <main>
        <div className="container">
          <div className="hero">
            <div className="hero-content">
              <div className="pre-title">Blockchain-Powered</div>
              <h1 className="title">Secure & Verifiable <span>Digital Certificates</span></h1>
              <p className="description">
                Issue tamper-proof certificates and credentials with CertiQ's decentralized platform. 
                Simplify verification and empower your organization with cutting-edge blockchain technology.
              </p>
              
              <div className="hero-buttons">
                <button 
                  className="button btn-primary"
                  onClick={handleIssueClick}
                >
                  Issue Certificate
                </button>
                <button 
                  className="button btn-outline"
                  onClick={() => navigate("/verify")}
                >
                  Verify Certificate
                </button>
              </div>
              
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <div className="feature-text">Tamper-proof Technology</div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <div className="feature-text">Instant Verification</div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <div className="feature-text">Global Accessibility</div>
                </div>
              </div>
            </div>
            
            <div className="hero-card">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Certificate Management</div>
                </div>
                <div className="card-body">
                  <div className="certificate-actions">
                    <div 
                      className="action-button" 
                      onClick={handleIssueClick}
                    >
                      <div className="action-icon action-issue">⬆️</div>
                      <div className="action-title">Issue</div>
                      <div className="action-desc">Create and distribute blockchain-verified certificates</div>
                    </div>
                    <div 
                      className="action-button"
                      onClick={() => navigate("/verify")}
                    >
                      <div className="action-icon action-verify">✓</div>
                      <div className="action-title">Verify</div>
                      <div className="action-desc">Instantly validate any certificate's authenticity</div>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  Need help? <a href="#">View Documentation</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};