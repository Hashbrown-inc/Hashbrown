// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract FileStorage {
    struct FileInfo {
        string fileHash;
        string[] serverUrls;
        bool isDeleted;
    }

    mapping(string => FileInfo) private files;
    AggregatorV3Interface private oracle;

    constructor(address oracleAddress) {
        oracle = AggregatorV3Interface(oracleAddress);
    }

    // ...

    function isUserAllowed(string memory fileId, address user) private view returns (bool) {
        // Request user access status from the oracle.
        // The oracle should return 1 for allowed users and 0 for disallowed users.
        (, int256 accessStatus, , , ) = oracle.latestRoundData();
        return accessStatus == 1;
    }
}
