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

async function uploadToFtp(partData, fileName) {
  try {
    isrunning = true;
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
const client = new basicFtp.Client();
io.on('connection', async (socket) => {
  console.log('A client has connected');

  client.ftp.verbose = true;
  try {
    await client.access({
      host: "premium48.web-hosting.com",
      user: "hashbrown@tulver.com",
      password: "EdR79%8ak!b3",
      secure: true,
    });
  }  catch (error) { }
  socket.on('upload', async ({ part }, callback) => {
      console.log("Uploaded part:", part);
      const randomFileName = getRandomFileName();
      console.log(`Uploading ${randomFileName} to FTP server...`);

      try {
          await uploadToFtp(part, randomFileName);
          console.log(`File part ${randomFileName} uploaded successfully`);
          socket.emit('uploadSuccess', { data: randomFileName });
          callback({}); // Send an empty response to indicate success
      } catch (error) {
          console.error(`Failed to upload file part ${randomFileName}`, error);
          callback({ error: `Failed to upload file part ${randomFileName}` });
      }
  });
});

server.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
});


