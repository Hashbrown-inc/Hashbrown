// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct FileInfo {
        string fileHash;
        string[] serverUrls;
        address[] allowedUsers;
        string[] secretkeys;
        bool isDeleted;
    }

    mapping(string => FileInfo) private files;
    
    modifier onlyAllowedUsers(string memory fileId) {
        require(isUserAllowed(fileId, msg.sender), "Not authorized");
        _;
    }

    function storeFile(string memory fileId, string memory fileHash, string[] memory serverUrls, address[] memory allowedUsers) public {
        require(bytes(files[fileId].fileHash).length == 0, "File already exists");
        
        files[fileId] = FileInfo({
            fileHash: fileHash,
            serverUrls: serverUrls,
            allowedUsers: allowedUsers,
            isDeleted: false,
            secretkeys: new string[](0)
        });
    }

    function storeFile(string memory fileId, string memory fileHash, string[] memory serverUrls, bytes32[] memory secretKeys) public {
        require(bytes(files[fileId].fileHash).length == 0, "File already exists");
        
        files[fileId] = FileInfo({
            fileHash: fileHash,
            serverUrls: serverUrls,
            allowedUsers: new address[](0),
            isDeleted: false,
            secretkeys: secretKeys
        });
    }

    function getFile(string memory fileId) public view onlyAllowedUsers(fileId) returns (string memory, string[] memory) {
        require(!files[fileId].isDeleted, "File has been deleted");

        return (files[fileId].fileHash, files[fileId].serverUrls);
    }

    function updateFile(string memory fileId, string memory newFileHash, string[] memory newServerUrls) public onlyAllowedUsers(fileId) {
        require(!files[fileId].isDeleted, "File has been deleted");

        files[fileId].fileHash = newFileHash;
        files[fileId].serverUrls = newServerUrls;
    }

    function deleteFile(string memory fileId) public onlyAllowedUsers(fileId) {
        files[fileId].isDeleted = true;
    }

    function isUserAllowed(string memory fileId, address user) private view returns (bool) {
        for (uint i = 0; i < files[fileId].allowedUsers.length; i++) {
            if (files[fileId].allowedUsers[i] == user) {
                return true;
            }
        }
        return false;
    }
}
