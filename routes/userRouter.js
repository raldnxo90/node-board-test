const express = require('express');
const userController = require('../controller/userController');
const { joinValidationRules, modifyValidationRules, validate } = require('../middlewares/validationMiddleware');
const passport = require('../config/passport');
const { uploadProfile } = require('../config/upload');

const router = express.Router();

// 회원가입
router.get('/join', userController.getJoin);
router.post('/join',
    uploadProfile.single('profileImage'),   
    //multer가 처리하고 req객체에 담은 파일을 서비스에서 처리
    joinValidationRules,
    validate('user/join'),
    userController.postJoin
);

// 이메일 중복확인
router.get('/check-email', userController.checkEmail);

// 로그인
router.get('/login', userController.getLogin);
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/user/login',
    failureMessage: true,
}));

// 로그아웃
router.get('/logout', userController.logout);

// 마이페이지
router.get('/info', userController.getInfo);

// 회원정보 수정
router.get('/modify', userController.getModify);
router.post('/modify',
    uploadProfile.single('profileImage'),   // multer 미들웨어로 파일 업로드 처리 (profileImage 필드의 파일을 처리)
    modifyValidationRules,
    validate('user/modify'),  // validate는 view 하나만
    userController.postModify // 통과 시 컨트롤러로
);

// 회원탈퇴
router.get('/delete', userController.getDelete);
router.post('/delete', userController.postDelete);

module.exports = router;