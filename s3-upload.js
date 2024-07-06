const express = require("express");
const AWS = require("aws-sdk");
const fs = require("fs");

const filePath = "./raj.png";

const app = express();
app.use(express.json());

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: "",
  secretAccessKey: "",
});

const params = {
  Bucket: "raj-youtube",
  Key: "raj2.png",
  Body: fs.createReadStream(filePath),
};

app.get("/", async (req, res) => {
  const s3 = new AWS.S3();
  const mp4FilePath = `test-video`;
  const writeStream = fs.createWriteStream("local.mp4");
  const readStream = s3
    .getObject({ Bucket: "raj-youtube", Key: mp4FilePath })
    .createReadStream();
  readStream.pipe(writeStream);
  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
  console.log("Downloaded s3 mp4 file locally");
  // s3.upload(params, (err, data) => {
  //   console.log(err);
  //   console.log(data);
  // });
});

app.listen(8080, () => {});
