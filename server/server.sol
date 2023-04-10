// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "SolidityCryptoLib/contracts/CryptoLib.sol"; // added import to implement the AES encryption.

contract FileStorage {

    event FileUpdated(string fileId, string oldFileHash, string[] oldServerUrls, string newFileHash, string[] newServerUrls);// to be used in the update File method.
    struct FileInfo {
        string fileHash;
        string[] serverUrls;
        address[] allowedUsers;
        string[] secretkeys;
        bool isDeleted;
        bytes encryptedData; 
    }

    mapping(string => FileInfo) private files;
    
    modifier onlyAllowedUsers(string memory fileId) {
        require(isUserAllowed(fileId, msg.sender), "Not authorized");
        _;
    }

    function storeFile(string memory fileId, string memory fileHash, string[] memory serverUrls, address[] memory allowedUsers, bytes memory fileData, string memory encryptionKey) public {
    require(bytes(files[fileId].fileHash).length == 0, "File already exists");

    bytes memory key = bytes(encryptionKey);
    bytes memory iv = CryptoLib.randomBytes(16); // Generate a random IV
    bytes memory encrypted = CryptoLib.aesEncrypt(fileData, key, iv);

    files[fileId] = FileInfo({
            fileHash: fileHash,
            serverUrls: serverUrls,
            allowedUsers: allowedUsers,
            isDeleted: false,
            secretkeys: new string[](0),
            encryptedData: encrypted
        });

    } // edited storeFile to implement the AES encryption. 

        function getFile(string memory fileId, string memory decryptionKey) public view onlyAllowedUsers(fileId) returns (string memory, string[] memory, bytes memory) {
        require(!files[fileId].isDeleted, "File has been deleted");

        bytes memory key = bytes(decryptionKey);
        bytes memory iv = CryptoLib.randomBytes(16); // Generate a random IV
        bytes memory decrypted = CryptoLib.aesDecrypt(files[fileId].encryptedData, key, iv);

        return (files[fileId].fileHash, files[fileId].serverUrls, decrypted);
        } //edited the getFile method to get the decrypted file  and return plainText Data.


        function updateFile(string memory fileId, string memory newFileHash, string[] memory newServerUrls, string memory encryptionKey) public onlyAllowedUsers(fileId) {
        require(!files[fileId].isDeleted, "File has been deleted");

        // Decrypt the existing file hash
        string memory decryptedFileHash = aesDecrypt(files[fileId].fileHash, encryptionKey);

        // Encrypt the new file hash
        string memory encryptedNewFileHash = aesEncrypt(newFileHash, encryptionKey);

        // Decrypt the existing server URLs
        string[] memory decryptedServerUrls = new string[](files[fileId].serverUrls.length);
        for (uint i = 0; i < files[fileId].serverUrls.length; i++) {
            decryptedServerUrls[i] = aesDecrypt(files[fileId].serverUrls[i], encryptionKey);
        }

        // Encrypt the new server URLs
        string[] memory encryptedNewServerUrls = new string[](newServerUrls.length);
        for (uint i = 0; i < newServerUrls.length; i++) {
            encryptedNewServerUrls[i] = aesEncrypt(newServerUrls[i], encryptionKey);
        }

        // Update the file hash and server URLs
        files[fileId].fileHash = encryptedNewFileHash;
        files[fileId].serverUrls = encryptedNewServerUrls;

        // Log the event
        emit FileUpdated(fileId, decryptedFileHash, decryptedServerUrls, newFileHash, newServerUrls);
    }// edited the updateFile method to implement the AES encryption. 


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
