const CryptoJS = require('crypto-js');
const axios = require('axios');
const fs = require('fs');

async function downloadAndCheckFile(serverUrls, encryptedParts, secretKey, expectedFileHash) {
  // Download the encrypted file parts from the servers
  const downloadedParts = await Promise.all(
    serverUrls.map(async (url, index) => {
      try {
        const response = await axios.get(url, { responseType: 'text' });
        console.log(`Downloaded part ${index} from ${url}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to download part ${index} from ${url}: ${error.message}`);
        return null;
      }
    })
  );

  // Decrypt the file parts
  const decryptedParts = downloadedParts.map((part, index) => {
    if (part) {
      try {
        const decrypted = CryptoJS.AES.decrypt(part, secretKey);
        return Buffer.from(decrypted.toString(CryptoJS.enc.Base64), 'base64');
      } catch (error) {
        console.error(`Failed to decrypt part ${index}: ${error.message}`);
        return null;
      }
    } else {
      return null;
    }
  });

  // Combine the decrypted parts into the original file
  const combinedBuffer = Buffer.concat(decryptedParts.filter(part => part));

  // Check the file hash
  const fileHash = CryptoJS.SHA256(combinedBuffer).toString();
  if (fileHash === expectedFileHash) {
    console.log('File hash verification succeeded');
  } else {
    console.error('File hash verification failed');
  }

  return combinedBuffer;
}

// Usage example
const serverUrls = [
  'https://server1.example.com/part-0',
  'https://server2.example.com/part-1',
  // ...
];
const encryptedParts = ['part-0', 'part-1', /* ... */];
const secretKey = 'your-secret-key';
const expectedFileHash = 'your-expected-file-hash';

downloadAndCheckFile(serverUrls, encryptedParts, secretKey, expectedFileHash)
  .then(result => {
    console.log('File download and check completed successfully');
    // Save the file, if desired
    fs.writeFileSync('./output.txt', result);
  })
  .catch(error => {
    console.error('File download and check failed:', error.message);
  });
