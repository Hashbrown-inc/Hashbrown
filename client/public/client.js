const socket = io();
document.addEventListener("DOMContentLoaded", function () {


    document.getElementById("file-input").addEventListener("change", (event) => {
        const fileInput = event.target;
        const status = document.getElementById("status");

        if (!fileInput.files.length) {
            status.textContent = "";
            return;
        }

        const file = fileInput.files[0];
        const fileName = file.name;
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const fileSizeChunks = Math.ceil(file.size / (500 * 1024));

        status.textContent = `Selected file: ${fileName} (${fileSizeMB} MB, ${fileSizeChunks} chunks of 500 KB)`;
    });
});

var names = [];
socket.on('uploadSuccess', (data) => {
    console.log("Upload success:", data);
    const status = document.getElementById("status");
    names.push(data.data);
    status.textContent = `Upload complete. File names: \n ${names.join(",")}`;
});

async function encryptAndUpload() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) {
        return alert('No file selected');
    }
    const secretKey = 'hashbrown-is-awesome';

    const blockSize = 1024 * 500; // 500 KB
    const totalParts = Math.ceil(file.size / blockSize);

    // Function to read a part of the file
    const readFilePart = (file, start, end) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsArrayBuffer(file.slice(start, end));
        });
    };
    // Encrypt the file parts and upload them
    for (let i = 0; i < totalParts; i++) {
        const start = i * blockSize;
        const end = Math.min(file.size, start + blockSize);
        const filePart = await readFilePart(file, start, end);
        const base64FilePart = arrayBufferToBase64(filePart);
        const encrypted = CryptoJS.AES.encrypt(base64FilePart, secretKey);
        const encryptedBase64 = encrypted.toString();

        // Wrap the socket.emit with a Promise to wait for the response
        await new Promise((resolve, reject) => {
            // wait .2 seconds before sending the next part
            setTimeout(() => {
                socket.emit('upload', { part: encryptedBase64, index: i }, (response) => {
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve();
                    }
                });
            }, 200);
           
        });
    }
}

socket.on('connect', () => {
    console.log('Connected to the server');
});

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}


socket.on('uploadError', (error) => {
    console.error(error);
});


//////////////////////////////////////////////////////////////////////
/////////////// Downloading files ////////////////////////////////////
//////////////////////////////////////////////////////////////////////
function base64ToArrayBuffer(base64) {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function decryptData(encryptedData, key) {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const base64Decrypted = decrypted.toString(CryptoJS.enc.Utf8);
    const byteArray = base64ToArrayBuffer(base64Decrypted);
    return new Uint8Array(byteArray);
}

async function downloadfiles() {
    const server = document.getElementById("webserver");
    const fileNames = document.getElementById("filenames");
    const key = document.getElementById("key");

    const fileNamesArray = fileNames.value.split(",");
    let combinedFileLength = 0;
    const decryptedFileParts = [];

    // Download and decrypt each file
    for (let i = 0; i < fileNamesArray.length; i++) {
        const fileName = fileNamesArray[i];

        const url = `https://${server.value}/${fileName}`;

        const response = await fetch(url);
        const encryptedFile = await response.text();
        console.log(`Downloaded ${fileName}`);

        const decryptedFile = decryptData(encryptedFile, key.value);
        combinedFileLength += decryptedFile.length;
        decryptedFileParts[i] = decryptedFile;
    }

    // Combine the decrypted file parts
    const combinedFile = new Uint8Array(combinedFileLength);
    let offset = 0;
    for (let i = 0; i < decryptedFileParts.length; i++) {
        const filePart = decryptedFileParts[i];
        combinedFile.set(filePart, offset);
        offset += filePart.length;
    }


    // Download the decrypted file
    const blob = new Blob([combinedFile], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "combinedFile";
    a.click();
    window.URL.revokeObjectURL(url);

    console.log("Download complete");
}
