
const express = require('express')

const userController = require('./../controllers/userController')

const authController = require('./../controllers/authController')

const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword)


//protect all routes after these middleware 
router.use(authController.protect)

router.get('/me',userController.getMe,userController.getUser)
router.patch('/updateMe', userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)
router.patch('/updateMyPassword',authController.updatePassword)

//
router.use(authController.restrictTo('admin'))

router.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);


router.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.delteUser);


module.exports = router