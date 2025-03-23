// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InstituteRegistration {
    address public owner;

    struct Institute {
        string name;
        string acronym;
        string website;
        uint256 registrationTime;
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

    mapping(address => Institute) public institutes;
    mapping(address => Course[]) public instituteCourses;
    mapping(bytes32 => Certificate) public certificates;

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
        require(institutes[msg.sender].exists, "Only registered institutes can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerInstitute(
        address _instituteAddress,
        string memory _name,
        string memory _acronym,
        string memory _website
    ) public onlyOwner {
        require(!institutes[_instituteAddress].exists, "Institute already registered");
        require(bytes(_name).length > 0, "Institute name cannot be empty");
        require(bytes(_acronym).length > 0, "Acronym cannot be empty");
        require(bytes(_website).length > 0, "Website cannot be empty");

        institutes[_instituteAddress] = Institute({
            name: _name,
            acronym: _acronym,
            website: _website,
            registrationTime: block.timestamp,
            exists: true
        });

        emit InstituteRegistered(_instituteAddress, _name, block.timestamp);
    }

    function addCourse(string memory _courseName) public onlyRegisteredInstitute {
        require(bytes(_courseName).length > 0, "Course name cannot be empty");
        instituteCourses[msg.sender].push(Course({ courseName: _courseName }));
        emit CourseAdded(msg.sender, _courseName);
    }

    function isRegistered(address _institute) public view returns (bool) {
        return institutes[_institute].exists;
    }

    function getInstitute(address _instituteAddress) public view returns (
        string memory name,
        string memory acronym,
        string memory website,
        uint256 registrationTime
    ) {
        require(institutes[_instituteAddress].exists, "Institute not found");
        Institute memory inst = institutes[_instituteAddress];
        return (inst.name, inst.acronym, inst.website, inst.registrationTime);
    }

    function getCourses(address _instituteAddress) public view returns (Course[] memory) {
        require(institutes[_instituteAddress].exists, "Institute not found");
        return instituteCourses[_instituteAddress];
    }
    function updateIpfsHash(bytes32 certHash, string memory newIpfsHash) public {
    require(certificates[certHash].isValid, "Certificate does not exist or is revoked");
    require(certificates[certHash].issuer == msg.sender, "Only the issuing institute can update the IPFS hash");
    require(bytes(newIpfsHash).length > 0, "IPFS hash cannot be empty");

    certificates[certHash].ipfsHash = newIpfsHash;  // Updating IPFS hash

    emit IpfsHashUpdated(certHash, newIpfsHash);  // Emit event
}
    event IpfsHashUpdated(bytes32 indexed certHash, string newIpfsHash);



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
            instituteName, department, firstName, lastName, certificantId, email, courseCompleted, completionDate, notes
        ));

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