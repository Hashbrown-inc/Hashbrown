# Hashbrown

Hashbrown is a file encryption protocol, storing hashes of file blocks on distributed ledgers.

- [Structured workflow](#mechanism) for Division of files into smaller parts for efficient storage and retrieval. Hash of file is retrieved beforehand for data integrity verification.
- Centralized servers with multiple buckets to randomly distribute file parts.
- Storing file hash and part location on a smart contract for tamper-resistance and auditability.
- Access control and authentication mechanisms to ensure secure access to file parts.

Project goals:

1. Improved data security --- AES encryption and smart contracts.
1. Reduced risk of data corruption due to distributed storage across multiple servers.
1. Improved data retrieval time and efficiency -- Through file division and distributed storage.
1. Enhanced data privacy -- Implement access control and authentication mechanisms.


[Check out the Demo...](https://hashbrown.it/)

## Local development

- Make sure the latest version of [Node.js](https://nodejs.org/) was installed (Homebrew: `brew install nodejs`)
- First time setup: `npm install`
- Build it all and run local dev server: `node start`
- view in a web browser at localhost:3000

Notes:

<a name="mechanism"></a>
## How does it work?

### Processing Pipeline

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


### Embeded Security Protocols

Hashbrown uses a permissioned blockchain to store encrypted key data and access control information. The files are encrypted using the Advanced Encryption Standard (AES) algorithm and are split into smaller parts using a sharding algorithm, and each part is stored on a different node in the network. Access to the encrypted files is controlled by the key stored on the blockchain, and only authorized parties with the correct key can access the files.

```solidity

const encryptedParts = fileParts.map(part => {
  return CryptoJS.AES.encrypt(part.toString('base64'), secretKey).toString();
});

const uploadPromises = encryptedParts.map(async (part, index) => {
  const serverUrl = serverUrls[index % serverUrls.length];
  const formData = new FormData();
  formData.append('file', new Blob([part], { type: 'text/plain' }), `part-${index}.txt`);

  try {
    await axios.post(serverUrl, formData, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      },
    });
    console.log(`Uploaded part ${index} to ${serverUrl}`);
  } catch (error) {
    console.error(`Failed to upload part ${index} to ${serverUrl}: ${error.message}`);
  }
});

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

## Testing strategy
We used manual testing to test the front-end features of our website, as it was the most efficient method, given our time constraints and our small website which only has two pages. We also used manual testing to test our file encryption protocol. We did not do unit testing as our project is very small in scope and we did not plan to build a lot of features on top of other features, so adding unit tests was not necessary. We tested our file encryption protocol as well as our website thoroughly and made sure all the features work. If the project grows in scope and scale later, some automated testing might be needed for the sake of efficiency.

