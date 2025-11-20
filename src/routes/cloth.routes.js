const express = require('express');
const clothController = require('../controllers/cloth.controllers')
const authMiddleware = require('../middlewares/auth.middleware');
const validator = require('../middlewares/clothCreate.validator.middleware');
const router = express.Router();
const multer = require('multer');


const upload = multer({
    storage: multer.memoryStorage(),
});

 
/* POST '/api/cloth'   [protected] */ 

router.post(
    '/',
    authMiddleware.authClothPartnerMiddleware,
    upload.single("file"), // <-- changed from "video" to "file"
    validator.clothValidationRules,
    validator.validateRequest,
    clothController.createCloth
);

/* GET '/api/cloth'  [public] */
router.get (
    '/',
    clothController.getAllCloths,
);

/* DELETE '/api/cloth/del/:id'  [protected] */

router.delete(
    '/del/:id',
    authMiddleware.authClothPartnerMiddleware,
    clothController.deleteCloth
);


module.exports = router