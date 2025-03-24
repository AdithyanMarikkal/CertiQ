require("dotenv").config();
const { ethers } = require("ethers");
const express = require("express");
const cors = require("cors");
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');



const app = express();
app.use(express.json());
app.use(cors());
const upload = multer({ dest: 'uploads/' });



const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ALCHEMY_URL = process.env.ALCHEMY_URL;

if (!ALCHEMY_URL) {
  console.error("Error: ALCHEMY_URL is not set in .env file");
  process.exit(1);
}

const PROVIDER = new ethers.JsonRpcProvider(ALCHEMY_URL);
const contractABI = require("./artifacts/contracts/InstituteRegistration.sol/InstituteRegistration.json").abi;
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, PROVIDER);

app.get("/api/isRegistered", async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: "Address is required" });

    const registered = await contract.isRegistered(address);
    res.json({ address, registered });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/upload', upload.single('image'), async (req, res) => {
  try {
      const fileStream = fs.createReadStream(req.file.path);

      const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', 
          {
              file: fileStream
          },
          {
              headers: {
                  'Content-Type': 'multipart/form-data',
                  'pinata_api_key': process.env.PINATA_API_KEY,
                  'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
              }
          }
      );

      fs.unlinkSync(req.file.path); // Delete temp file

      res.json({ hash: pinataResponse.data.IpfsHash });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
