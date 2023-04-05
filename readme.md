# Hashbrown

Hashbrown is a file encryption protocol, storing hashes of file blocks on distributed ledgers.

- [structured workflow](#mechanism) for Division of files into smaller parts for efficient storage and retrieval. Hash of file is retrieved beforehand for data integrity verification.
- centralized servers with multiple buckets to randomly distribute file parts.
- storing file hash and part location on a smart contract for tamper-resistance and auditability.
- access control and authentication mechanisms to ensure secure access to file parts.

Project goals:

1. Improved data security --- AES encryption and smart contracts.
1. Reduced risk of data corruption due to distributed storage across multiple servers.
1. Improved data retrieval time and efficiency -- Through file division and distributed storage.
1. Enhanced data privacy --> Implement access control and authentication mechanisms.


[Check out the Demo...](https://hashbrown.it/)

## Local development

- Make sure the latest version of [Node.js](https://nodejs.org/) was installed (Homebrew: `brew install nodejs`)
- First time setup: `npm install`
- Build it all and run local dev server: `node app.js`

Notes:

<a name="mechanism"></a>
## Mechanisms
The process involves sending a request to a smart contract with file ID and permissions for storage, followed by encryption, splitting, and storage of parts in buckets on centralized servers. The file hash is also stored on the contract. To retrieve the file, the user combines parts and obtains a decryption key from the contract after permission verification to decrypt and access the file.

```
Encryption
──────────────────────────────────────────────────────────────────────────────►

┌─────────────────────┐             ┌────────────┐              ┌─────────────┐
│                     │Request sent │            │  Store into  │             │
│   File ID & Perms   ├────────────►│   Accept   ├─────────────►│   Buckets   │
│                     │ to contract │            │              │             │
└─────────────────────┘             └────────────┘              └──────┬──────┘
           ▲                                                           │
           │            ┌──────┐                                       │
           │         ┌──┤ Hash │                                       ▼
┌──────────┴─────────┤  └──────┘    ┌─────────────┐              ┌────────────┐
│                    │              │             │  Gather parts│            │
│   Combine Parts    │◄─────────────┤   Decrypt   │◄─────────────┤   Gather   │
│                    │              │             │              │            │
└────────────────────┘              └─────────────┘              └────────────┘
                                                                      Retrieval
◄──────────────────────────────────────────────────────────────────────────────
```

## Q&A 

> Why Hashbrown?

Current IPFS system has some major flaws: 
- Scalability issues due to increased latency and bandwidth consumption as the number of nodes grows.
- Uncertainty around data persistence because of the volunteer-based nature of data storage and sharing.
- Potential for network latency when retrieving data, especially if it is not cached nearby.
- Limited privacy protections, as metadata can be visible to other nodes even if data is encrypted.
- Environmental concerns around the energy consumption of PoW operations, raising questions about long-term sustainability.


## Things the code still needs
- One time download link
- Shuffle file location every use
- Incorporate key permission system

