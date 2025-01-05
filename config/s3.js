const { S3Client } = require("@aws-sdk/client-s3");
const { NodeHttpHandler } = require("@smithy/node-http-handler");

const httpHandler = new NodeHttpHandler({
    connectionTimeout: 10000, // Time to establish connection (10 seconds)
    socketTimeout: 900000,    // Time for socket inactivity (15 minutes)
});
const s3 = new S3Client({
    region: process.env.AWS_REGION, // Your AWS region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    requestHandler: httpHandler,

});
console.log("s3 client configured")

module.exports = s3