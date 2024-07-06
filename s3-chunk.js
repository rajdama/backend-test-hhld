const AWS = require("aws-sdk");
const fs = require("fs");
const express = require("express");

const filePath = "./test.mp4";

const app = express();
app.use(express.json());

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: "",
  secretAccessKey: "",
});

app.get("/", async (req, res) => {
  const uploadParams = {
    Bucket: "raj-youtube",
    Key: "test-video",
    ACL: "public-read",
    ContentType: "video/mp4",
  };
  const s3 = new AWS.S3();

  console.log("Creating multipart upload ......");

  const multiPartParams = await s3
    .createMultipartUpload(uploadParams)
    .promise();
  const fileSize = fs.statSync(filePath).size;
  const chunkSize = 5 * 1024 * 1024;
  const numParts = Math.ceil(fileSize / chunkSize);

  const uploadEtags = []; // Store Etags for uploaded part

  for (let i = 0; i < numParts; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, fileSize); // If file size is less then chunk size so only 1 file exists even on chunking

    const partParams = {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      UploadId: multiPartParams.UploadId,
      PartNumber: i + 1,
      Body: fs.createReadStream(filePath, { start, end }),
      ContentLength: end - start,
    };

    const data = await s3.uploadPart(partParams).promise();
    console.log(`Uploaded part ${i + 1} :: E-Tag ${data.ETag}`);

    uploadEtags.push({ PartNumber: i + 1, ETag: data.ETag });
  }

  const completeParams = {
    Bucket: uploadParams.Bucket,
    Key: uploadParams.Key,
    UploadId: multiPartParams.UploadId,
    MultipartUpload: { Parts: uploadEtags },
  };

  console.log("Completing Multipart Upload");

  const completeRes = await s3
    .completeMultipartUpload(completeParams)
    .promise();
  console.log(completeRes);

  res.status(200).send(completeRes);
});

app.listen(8080, () => {});
