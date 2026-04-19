const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

// 구글 로그인 시작
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
        //scope: 구글에서 가져올 사용자 정보 범위 지정, profile: 기본 프로필 정보(이름, 프로필 사진 등), email: 이메일 주소
    })
);

// 구글 인증 후 콜백
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/user/login',
        successRedirect: '/'
    })
);

// 네이버 로그인 시작
router.get('/naver',
    passport.authenticate('naver')
);

// 네이버 인증 후 콜백
router.get('/naver/callback',
    passport.authenticate('naver', {
        failureRedirect: '/user/login',
        successRedirect: '/'
    })
);

module.exports = router;



