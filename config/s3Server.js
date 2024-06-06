const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { Upload } = require('@aws-sdk/lib-storage')


const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY
    },
})

const getObjectUrl = async (key) => {
    const command = new GetObjectCommand(
        {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        }
    )
    const url = await getSignedUrl(s3Client, command);
    return url;
}

const putObjectUrl = async (filePath, contentType,body) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filePath,
        ContentType: contentType,
        Body: body 
    })

    const url = await getSignedUrl(s3Client, command);

    return url
}

const deleteObjectUrl = async (fileName) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${fileName}`
    })

    await s3Client.send(command);
}

const uploadImageToS3 = async (imageProps) => {
    const { filePath, contentType, body } = imageProps;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filePath,
        ContentType: contentType,
        Body: body
    });

    await s3Client.send(command);
}


const uploadImageToS3_Type2 = async (imageProps) => {
    const { filePath, contentType, body } = imageProps;

    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: filePath,
            ContentType: contentType,
            Body: body,
        },
    });
    // console.log('hello world',upload);

    await upload.done();
}


module.exports = {
    getObjectUrl,
    putObjectUrl,
    deleteObjectUrl,
    uploadImageToS3,
    uploadImageToS3_Type2
}