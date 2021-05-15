const express = require('express');
const router = new express.Router();
const controller = require('../controller/controller')
const store = require('../middleware/multer')
const User = require('../model/userSchema');
const auth = require('../middleware/auth')


router.get('/uploadmultiple',auth,controller.uploadImg);

router.get('/',controller.index);

router.get('/login',controller.login);

router.get('/register',controller.register);

router.post('/uploadmultiple',store.array('images',12),controller.uploads)

module.exports = router;