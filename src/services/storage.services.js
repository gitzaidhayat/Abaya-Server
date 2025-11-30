const ImageKit = require("imagekit");
const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
});


async function uploadImage(file, fileName){
    const result = await imagekit.upload({
        file : file,
        fileName : fileName});
    return result;
}

async function uploadVideo(file, fileName, folder = 'videos') {
    const result = await imagekit.upload({
        file: file,
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true,
        tags: ['product-video']
    });
    return result;
}

module.exports = {
    uploadImage,
    uploadVideo,
}