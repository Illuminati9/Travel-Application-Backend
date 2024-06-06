const profileS3Url = 'uploads/profiles';
const postS3Url = 'uploads/posts';
const ownerS3Url = 'uploads/owners';
const ownerS3UrlProof = 'uploads/owner/proofs'
const busS3Url = 'uploads/buses';

const svgType = 'image/svg+xml';
const svgType2 = 'image/svg';
const jpegType = 'image/jpeg';
const pngType = 'image/png';
const jpgType = 'image/jpg';

const allowedFileTypes = [svgType, jpegType, pngType, jpgType, svgType2];

module.exports = {profileS3Url,postS3Url,ownerS3Url,busS3Url, ownerS3UrlProof,svgType,jpegType,pngType,jpgType,svgType2,allowedFileTypes};