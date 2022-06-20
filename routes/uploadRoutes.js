const AWS = require('aws-sdk');
const keys = require('../config/keys');
const uuid = require('uuid/v1') // Nothing special about v1
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({ 
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey
});

module.exports = app => {
    app.get('/api/upload',requireLogin, (req, res) => {
        const key = `${req.user.id}/${uuid()}.jpeg`;

        s3.getSignedUrl('putObject', {  // putObject means upload a file in AWS S3.
            Bucket: 'my-blog-bucket-123', // Sample bucket name
            ContentType: 'image/jpeg',
            Key: key
        }, (err, url) => res.send({key, url}));
     
    });
};

/* We installed npm module(uuid) to generate a unique user identifier. It generates a string of random numbers and letters for use in uniquely renaming uploaded files to avoid accidental deletion or overwritting.*/