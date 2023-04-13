const socket = io();

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


socket.on('uploadSuccess', (data) => {
    const status = document.getElementById("status");

    status.textContent = `Upload complete. File names: \n ${data.names}`;
});


async function encryptAndUpload() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) {
        return alert('No file selected');
    }
    const secretKey = 'hashbrown-is-awesome';

    const blockSize = 1024 * 500; // 1KB // 1mb = 1024 * 1024
    const fileBuffer = await file.arrayBuffer();
    const fileParts = [];

    // Split the file into parts
    for (let i = 0; i < fileBuffer.byteLength; i += blockSize) {
        const end = Math.min(i + blockSize, fileBuffer.byteLength);
        fileParts.push(new Uint8Array(fileBuffer.slice(i, end)));
    }

    // Helper function to convert ArrayBuffer to Base64
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // Helper function to convert Base64 to ArrayBuffer
    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Encrypt the file parts
    const encryptedParts = fileParts.map(part => {
        const partBase64 = arrayBufferToBase64(part.buffer);
        const encryptedBase64 = CryptoJS.AES.encrypt(partBase64, secretKey).toString();
        return new Uint8Array(base64ToArrayBuffer(encryptedBase64));
    });

    // for each part upload
    socket.emit('upload', { encryptedParts });
}

socket.on('connect', () => {
    console.log('Connected to the server');
});


socket.on('uploadSuccess', (result) => {
    console.log(result);
});

socket.on('uploadError', (error) => {
    console.error(error);
});

