// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FileRegistry {
    struct Document {
        bytes32 fileHash;         // SHA-256 hash of the document
        address issuer;           // Institution that issued the document
        uint256 timestamp;        // When it was issued
        string docType;           // e.g. "Degree", "Transcript"
        bool isRevoked;           // Revocation flag
    }

    // Mapping: fileHash => Document
    mapping(bytes32 => Document) public documents;

    // Events
    event DocumentRegistered(bytes32 indexed fileHash, address indexed issuer, string docType, uint256 timestamp);
    event DocumentRevoked(bytes32 indexed fileHash, address indexed issuer, uint256 timestamp);

    /// @notice Register a new document
    function registerDocument(bytes32 fileHash, string calldata docType) external {
        require(documents[fileHash].timestamp == 0, "Document already exists");

        documents[fileHash] = Document({
            fileHash: fileHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            docType: docType,
            isRevoked: false
        });

        emit DocumentRegistered(fileHash, msg.sender, docType, block.timestamp);
    }

    /// @notice Revoke a document (only by issuer)
    function revokeDocument(bytes32 fileHash) external {
        Document storage doc = documents[fileHash];
        require(doc.timestamp != 0, "Document does not exist");
        require(doc.issuer == msg.sender, "Only issuer can revoke");
        require(!doc.isRevoked, "Already revoked");

        doc.isRevoked = true;

        emit DocumentRevoked(fileHash, msg.sender, block.timestamp);
    }

    /// @notice Verify a document
    function verifyDocument(bytes32 fileHash) external view returns (Document memory) {
        require(documents[fileHash].timestamp != 0, "Document not found");
        return documents[fileHash];
    }
}
