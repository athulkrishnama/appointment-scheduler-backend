const { Upload } = require('@aws-sdk/lib-storage');
const s3 = require('../config/s3');




const uploadLogo = async (file) => {
    try {
        const imagelink = `logo/${Date.now()}`;
        const buffer = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data);
        
        console.log("Starting upload with buffer size:", buffer.length);

        const upload = new Upload({
            client: s3,
            params: {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: imagelink,
                Body: buffer,
                ContentType: file.mimetype || 'image/jpeg',
            },
       
        });

        const result = await upload.done();
        return result.Location

    } catch (error) {
        console.error('Upload failed:', {
            message: error.message,
            code: error.code,
            statusCode: error.$metadata?.httpStatusCode,
            attempts: error.$metadata?.attempts
        });
        throw error;
    }
};

module.exports = {
    uploadLogo,
};