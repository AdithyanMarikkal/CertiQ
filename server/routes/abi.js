const express = require("express");
const path = require("path");
const router = express.Router();

// Define the path to your ABI file (Adjust the path if needed)
const ABI_PATH = path.join(__dirname, "../artifacts/contracts/InstituteRegistration.sol/InstituteRegistration.json");

router.get("/abi", (req, res) => {
    try {
        const abi = require(ABI_PATH); // Load ABI JSON file
        res.json(abi.abi); // Send only the ABI part
    } catch (error) {
        res.status(500).json({ error: "ABI file not found or invalid" });
    }
});

module.exports = router;