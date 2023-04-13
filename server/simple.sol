//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract CustomSmartContract {
    // Define a custom structure
    struct CustomVar {
        string serverUrl;
        string[] hashes;
        address[] allowedUsers;
    }

    // Declare an array of the custom structure
    CustomVar[] private customVars;

    // Contract owner
    address private owner;

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Modifier to restrict access to allowed users of a specific CustomVar
    modifier onlyAllowedUser(uint256 index) {
        require(index < customVars.length, "Index out of bounds");
        bool isAllowed = false;
        for (uint256 i = 0; i < customVars[index].allowedUsers.length; i++) {
            if (msg.sender == customVars[index].allowedUsers[i]) {
                isAllowed = true;
                break;
            }
        }
        require(isAllowed, "Only allowed users can call this function");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Create a new CustomVar (owner only)
    function createCustomVar(string calldata serverUrl) external onlyOwner {
        CustomVar memory newCustomVar = CustomVar({
            serverUrl: serverUrl,
            hashes: new string[](0),
            allowedUsers: new address[](0)
        });
        customVars.push(newCustomVar);
    }

    // Get a CustomVar data if the user is allowed
    function getCustomVar(uint256 index)
        external
        view
        onlyAllowedUser(index)
        returns (
            string memory,
            string[] memory,
            address[] memory
        )
    {
        return (
            customVars[index].serverUrl,
            customVars[index].hashes,
            customVars[index].allowedUsers
        );
    }

    // Set server URL of a CustomVar (owner only)
    function setServerUrl(uint256 index, string calldata url)
        external
        onlyOwner
    {
        require(index < customVars.length, "Index out of bounds");
        customVars[index].serverUrl = url;
    }

    // Add a hash to a CustomVar (owner only)
    function addHash(uint256 index, string calldata hash) external onlyOwner {
        require(index < customVars.length, "Index out of bounds");
        customVars[index].hashes.push(hash);
    }

    // Add an allowed user to a CustomVar (owner only)
    function addAllowedUser(uint256 index, address user) external onlyOwner {
        require(index < customVars.length, "Index out of bounds");
        customVars[index].allowedUsers.push(user);
    }

    // Remove a hash from a CustomVar (owner only)
    function removeHash(uint256 index, uint256 hashIndex) external onlyOwner {
        require(index < customVars.length, "Index out of bounds");
        require(
            hashIndex < customVars[index].hashes.length,
            "Hash index out of bounds"
        );
        customVars[index].hashes[hashIndex] = customVars[index].hashes[
            customVars[index].hashes.length - 1
        ];
        customVars[index].hashes.pop();
    }

    // Remove an allowed user from a CustomVar (owner only)
    function removeAllowedUser(uint256 index, uint256 userIndex)
        external
        onlyOwner
    {
        require(index < customVars.length, "Index out of bounds");
        require(
            userIndex < customVars[index].allowedUsers.length,
            "User index out ofbounds"
        );
        customVars[index].allowedUsers[userIndex] = customVars[index]
            .allowedUsers[customVars[index].allowedUsers.length - 1];
        customVars[index].allowedUsers.pop();
    }
}
