// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ServerPerms.sol";

contract FileStorage {
    struct FileInfo {
        string fileHash;
        string[] serverUrls;
        bool isDeleted;
    }

    mapping(string => FileInfo) private files;
    ServerPerms private serverPerms;

    constructor(address oracleAddress, address serverPermsAddress) {
        serverPerms = ServerPerms(serverPermsAddress);
    }

    function addFile(string memory fileId, string memory fileHash, string[] memory serverUrls) public {
        require(!serverPerms.isServerAllowed(msg.sender), "Only registered servers are allowed to add files");
        FileInfo storage fileInfo = files[fileId];
        fileInfo.fileHash = fileHash;
        fileInfo.serverUrls = serverUrls;
        fileInfo.isDeleted = false;
    }

    function removeFile(string memory fileId) public {
        require(!serverPerms.isServerAllowed(msg.sender), "Only registered servers are allowed to remove files");
        files[fileId].isDeleted = true;
    }
}
