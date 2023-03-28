const CryptoJS = require('crypto-js');
const axios = require('axios');
const fs = require('fs');

async function uploadFile(filePath, serverUrls, secretKey) {
  const fileBuffer = fs.readFileSync(filePath);
  const blockSize = 1024 * 1024; // 1MB
  const fileParts = [];

  // Split the file into parts
  for (let i = 0; i < fileBuffer.length; i += blockSize) {
    fileParts.push(fileBuffer.subarray(i, i + blockSize));
  }  

  // Encrypt the file parts
  const encryptedParts = fileParts.map(part => {
    return CryptoJS.AES.encrypt(part.toString('base64'), secretKey).toString();
  });

  // Upload the encrypted file parts to the servers
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

  await Promise.all(uploadPromises);

  // Calculate the file hash (using SHA-256 in this example)
  const fileHash = CryptoJS.SHA256(fileBuffer).toString();

  return { fileHash, encryptedParts, serverUrls };
}

// Usage example
const filePath = './example.txt';
const serverUrls = ['https://server1.example.com/upload', 'https://server2.example.com/upload'];
const secretKey = 'your-secret-key';

uploadFile(filePath, serverUrls, secretKey)
  .then(result => {
    console.log('File uploaded successfully:', result);
  })
  .catch(error => {
    console.error('File upload failed:', error.message);
  });
