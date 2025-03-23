// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InstituteRegistration {
    address public owner;

    struct Institute {
        string name;
        string acronym;
        string website;
        uint256 registrationTime;
        bool isRegistered;
        bool exists;
    }

    struct PendingInstitute {
        string name;
        string acronym;
        string website;
        bool exists;
    }

    struct Course {
        string courseName;
    }

    struct Certificate {
        string instituteName;
        string department;
        string firstName;
        string lastName;
        string certificantId;
        string email;
        string courseCompleted;
        uint256 completionDate;
        string notes;
        string ipfsHash;
        bool isValid;
        address issuer;
    }

    mapping(address => Course[]) public instituteCourses;
    mapping(bytes32 => Certificate) public certificates;
    mapping(address => Institute) public registeredInstitutes;
    mapping(address => PendingInstitute) public pendingRequests;

    event InstituteRequested(address indexed instituteAddress, string name);
    event InstituteRegistered(address indexed instituteAddress, string name, uint256 registrationTime);
    event CourseAdded(address indexed instituteAddress, string courseName);
    event CertificateIssued(
        bytes32 indexed certHash,
        string instituteName,
        string department,
        string firstName,
        string lastName,
        string certificantId,
        string email,
        string courseCompleted,
        uint256 completionDate,
        string notes,
        string ipfsHash
    );
    event CertificateRevoked(bytes32 indexed certHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized: Only owner can perform this action");
        _;
    }

    modifier onlyRegisteredInstitute() {
        require(registeredInstitutes[msg.sender].exists, "Only registered institutes can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function requestRegistration(string memory _name, string memory _acronym, string memory _website) public {
        require(!registeredInstitutes[msg.sender].isRegistered, "Already registered");
        require(!pendingRequests[msg.sender].exists, "Request already pending");

        pendingRequests[msg.sender] = PendingInstitute(_name, _acronym, _website, true);
        emit InstituteRequested(msg.sender, _name);
    }


    function approveRegistration(address _institute) public onlyOwner {
        require(pendingRequests[_institute].exists, "No pending request found");

        PendingInstitute memory pending = pendingRequests[_institute];
        registeredInstitutes[_institute] = Institute(pending.name, pending.acronym, pending.website,block.timestamp, true, true);
        
        delete pendingRequests[_institute];
        emit InstituteRegistered(_institute, pending.name , block.timestamp);
    }

    function isRegistered(address _institute) public view returns (bool) {
        return registeredInstitutes[_institute].isRegistered;
    }
    function getPendingInstitute(address _institute) public view returns (string memory, string memory, string memory, bool) {
        PendingInstitute memory pending = pendingRequests[_institute];
        return (pending.name, pending.acronym, pending.website, pending.exists);
    }

    function getInstitute(address _instituteAddress) public view returns (
        string memory name,
        string memory acronym,
        string memory website,
        uint256 registrationTime
    ) {
        require(registeredInstitutes[_instituteAddress].exists, "Institute not found"); // ✅ Fixed mapping reference
        Institute memory inst = registeredInstitutes[_instituteAddress]; 
        return (inst.name, inst.acronym, inst.website, inst.registrationTime);
    }

    function addCourse(string memory _courseName) public onlyRegisteredInstitute {
    require(bytes(_courseName).length > 0, "Course name cannot be empty");
    
    Course[] storage courses = instituteCourses[msg.sender];
    for (uint256 i = 0; i < courses.length; i++) {
        require(keccak256(bytes(courses[i].courseName)) != keccak256(bytes(_courseName)), "Course already exists");
    }

    courses.push(Course({ courseName: _courseName }));
    emit CourseAdded(msg.sender, _courseName);
    }

    function getCourses(address _instituteAddress) public view returns (Course[] memory) {
        require(registeredInstitutes[_instituteAddress].exists, "Institute not found");
        return instituteCourses[_instituteAddress];
    }

    function issueCertificate(
        string memory instituteName,
        string memory department,
        string memory firstName,
        string memory lastName,
        string memory certificantId,
        string memory email,
        string memory courseCompleted,
        uint256 completionDate,
        string memory notes,
        string memory ipfsHash
    ) public onlyRegisteredInstitute {
        bytes32 certHash = keccak256(abi.encodePacked(
            instituteName, department, firstName, lastName, certificantId, email, courseCompleted, completionDate, notes, ipfsHash
        ));

        // 🔹 Prevent issuing duplicate certificates
        require(certificates[certHash].issuer == address(0), "Certificate already exists");

        certificates[certHash] = Certificate(
            instituteName, department, firstName, lastName, certificantId, email, courseCompleted, completionDate, notes, ipfsHash, true, msg.sender
        );

        emit CertificateIssued(certHash, instituteName, department, firstName, lastName, certificantId, email, courseCompleted, completionDate, notes, ipfsHash);
    }

    function revokeCertificate(bytes32 certHash) public {
        require(certificates[certHash].isValid, "Certificate does not exist or is already revoked");
        require(certificates[certHash].issuer == msg.sender, "Only the issuing institute can revoke this certificate");
        certificates[certHash].isValid = false;
        emit CertificateRevoked(certHash);
    }

    function verifyCertificate(bytes32 certHash) public view returns (
        bool, string memory, string memory, string memory, string memory, string memory, string memory, string memory, uint256, string memory, string memory
    ) {
        Certificate memory cert = certificates[certHash];
        return (
            cert.isValid, cert.instituteName, cert.department, cert.firstName, cert.lastName, cert.certificantId, cert.email, cert.courseCompleted, cert.completionDate, cert.notes, cert.ipfsHash
        );
    }
}