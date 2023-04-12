function decryptData(encryptedData, key) {
  const encryptedDataInWordArray = CryptoJS.lib.WordArray.create(encryptedData);
  const utf8Key = CryptoJS.enc.Utf8.parse(key);
  const decryptedData = CryptoJS.AES.decrypt(
    { ciphertext: encryptedDataInWordArray },
    utf8Key,
    {
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding,
    }
  );

  return decryptedData;
}

async function downloadfiles() {
  const server = document.getElementById("webserver");
  const fileNames = document.getElementById("filenames");
  const key = document.getElementById("key");

  const fileNamesArray = fileNames.value.split(",");
  const combinedFile = new Uint8Array();
  let currentPosition = 0;

  // download each file and decrypt it
  for (let i = 0; i < fileNamesArray.length; i++) {
    const fileName = fileNamesArray[i];

    const url = `https://${server.value}/${fileName}`;
    
    const response = await fetch(url);
    const encryptedFile = await response.arrayBuffer();
    const decryptedFile = decryptData(encryptedFile, key.value);
    const decryptedFileArray = new Uint8Array(decryptedFile);
    combinedFile.set(decryptedFileArray, currentPosition);
    currentPosition += decryptedFileArray.length;
  }

  // download the file
  const blob = new Blob([combinedFile], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'combinedFile';
  a.click();
  window.URL.revokeObjectURL(url);

  console.log('Download complete');
}