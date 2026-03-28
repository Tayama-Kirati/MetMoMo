const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req,file, cb) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only JPEG, JPG, and PNG files are allowed'));
      } 
        cb(null, './uploads'); // Specify the destination directory for uploaded files
    },
    filename: function (req,file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Create a unique filename
    }
});
module.exports =  {
multer,
storage
};
