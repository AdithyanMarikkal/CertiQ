import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import './Navbar.css';

const contractABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_institute", type: "address" }],
    name: "isRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  }
];

const Navbar = ({ featuresRef, aboutRef }) => {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contract, setContract] = useState(null);
  const navigate = useNavigate();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";
  const location = useLocation();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);


  const scrollToSection = (elementRef) => {
    // Only scroll if on home page
    if (location.pathname === "/") {
      elementRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to home page
      navigate("/", { 
        state: { 
          scrollTo: elementRef.current 
        } 
      });
    }
  };


  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum && contractAddress) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);
          setContract(contractInstance);
        } catch (error) {
          console.error("Error initializing contract:", error);
        }
      }
    };
    
    initContract();
  }, [contractAddress]);

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            checkAdmin(accounts[0]);
            checkIfRegistered(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking MetaMask accounts:", error);
        }
      }
    };

    if (contract) {
      checkWallet();
    }

    // If wallet was connected before, refresh once to ensure components recognize it
    if (localStorage.getItem("walletConnected") === "true") {
      localStorage.removeItem("walletConnected"); // Prevent infinite reloads
      window.location.reload();
    }

  }, [contract]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        checkAdmin(accounts[0]);

        if (contract) {
          checkIfRegistered(accounts[0]);
        }

        // Store connection status in localStorage
        localStorage.setItem("walletConnected", "true");

        // Refresh the whole window
        window.location.reload();

      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }

    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  const checkAdmin = async (walletAddress) => {
    if (!contractAddress || !contract) return;

    try {
      const owner = await contract.owner();
      setIsAdmin(walletAddress.toLowerCase() === owner.toLowerCase());
    } catch (error) {
      console.error("Error checking admin:", error);
    }
  };

  const checkIfRegistered = async (address) => {
    if (!contract) return;
    try {
      const registered = await contract.isRegistered(address);
      setIsRegistered(registered);
    } catch (error) {
      console.error("Error checking registration status:", error);
      setIsRegistered(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <header className={isDarkMode ? 'dark-mode' : ''}>
      <div className="container header-container">
        <a href="#" className="logo" onClick={() => navigate("/")}>
          <div className="logo-icon">CQ</div>
          CertiQ
        </a>
        <div className="nav-menu">
          <ul className="nav-links">

            <li><a href="/" className="nav-link" onClick={() => navigate("/")}>Home</a></li>
            <li><a href="#features" className="nav-link" onClick={() => scrollToSection(featuresRef)}>Features</a></li>
            <li><a href="#about" className="nav-link" onClick={() => scrollToSection(aboutRef)}>About</a></li>
          </ul>
          <div className="toggle-container">
            <button 
              id="theme-toggle" 
              className="theme-toggle" 
              onClick={toggleTheme}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button 
              className="button btn-outline" 
              onClick={connectWallet}
            >
              {account ? "Connected" : "Connect"}
            </button>
            {location.pathname === "/" && account && !isRegistered && (
              <button 
                className="button btn-primary" 
                onClick={() => navigate("/register")}
              >
                Register Institute
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;