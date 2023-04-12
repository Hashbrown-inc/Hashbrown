const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const basicFtp = require('basic-ftp');
const crypto = require('crypto');
const { Readable } = require('stream');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

async function uploadToFtp(partData, fileName, client) {
  try {
    const partBuffer = Buffer.from(partData);
    const stream = new Readable();
    stream.push(partBuffer);
    stream.push(null);
    await client.uploadFrom(stream, fileName);
  } catch (error) {
    console.error("FTP upload error:", error);
  }
}

function getRandomFileName() {
  const randomNum = Math.floor(Math.random() * 10000);
  const hash = crypto.createHash('md5').update(String(randomNum)).digest('hex');
  return `${randomNum}-${hash}`;
}

io.on('connection', (socket) => {
  console.log('A client has connected');

  socket.on('upload', async ({ encryptedParts }) => {
    console.log("Uploaded parts:", encryptedParts);
    let names = "";

    const client = new basicFtp.Client();
    client.ftp.verbose = true;
    try {
      await client.access({
        host: "premium48.web-hosting.com",
        user: "hashbrown@tulver.com",
        password: "EdR79%8ak!b3",
        secure: true,
      });
    }
    catch (error) { }

    for (const part of encryptedParts) {
      const randomFileName = getRandomFileName();
      console.log(`Uploading ${randomFileName} to FTP server...`);
      await uploadToFtp(part, randomFileName, client);
      names += randomFileName + ",";
    }
    //remove last comma
    names = names.slice(0, -1);
    socket.emit('uploadComplete', { message: 'File upload completed.' });
    socket.emit('uploadSuccess', { names });
    client.close();
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
