const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
//Strategy: 인증 방법을 정의하는 객체

const GoogleStrategy = require('passport-google-oauth20').Strategy;
//GoogleStrategy: 구글 OAuth 2.0 인증을 위한 전략 객체

const NaverStrategy = require('passport-naver-v2').Strategy;
//NaverStrategy: 네이버 OAuth 인증을 위한 전략 객체

const bcrypt = require('bcrypt');
const userService = require('../services/userService');

//passport에 전략을 등록(이메일과 비밀번호로 로그인하는 로컬 전략)
passport.use(new LocalStrategy({
    usernameField: 'email', // 로그인 시 사용할 필드 이름
    passwordField: 'password' // 로그인 시 사용할 필드 이름
}, async (email, password, done) => {
    try {
        const user = await userService.findUserByEmail(email);
        if (!user) {
            return done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }
        // 이메일이 일치하는 사용자가 DB에 없는 경우 인증 실패 처리
        // null: 서버 에러 없음, false: 인증 실패, message: 실패 메시지 객체

        const isMatch = await bcrypt.compare(password, user.password);
        // 입력된 비밀번호와 저장된 해시된 비밀번호 비교(인자 순서 주의, bcrypt.compare(평문 비밀번호, 해시된 비밀번호))

        if (!isMatch) {
            return done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }
        // 비밀번호가 일치하지 않는 경우 인증 실패 처리
        // null: 서버 에러 없음, false: 인증 실패, message: 실패 메시지 객체

        return done(null, user);
        // 인증 성공 시 사용자 객체 반환
    } catch (err) {
        return done(err);//서버 오류(DB 연결 실패 등)
    }
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Google Cloud Console에서 발급
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google Cloud Console에서 발급
    callbackURL: '/auth/google/callback' // 구글 인증 후 리디렉션될 URL(Google Cloud Console에 등록한 URI와 반드시 일치해야 함)
}, async (accessToken, refreshToken, profile, done) => {
    // accessToken: 구글에서 발급한 액세스 토큰(사용자 정보에 접근할 때 사용, 유효 기간이 있음)
    // refreshToken: 구글에서 발급한 재발급 토큰(액세스 토큰이 만료되었을 때 새로 발급받을 때 사용, 구글 캘린더 등 추가 권한이 필요한 경우 DB에 저장하여 필요할 때마다 사용)
    // profile: 구글에서 반환하는 사용자 프로필 정보
    try {
        const email = profile.emails?.[0]?.value; // 구글에서 제공하는 이메일 주소
        let user = await userService.findUserByEmail(email);
        // 같은 이메일로 가입된 로컬 유저가 있는지 확인(계정 연동)

        if (user) {
            return done(null, user); // 기존 로컬 유저로 로그인
        }

        // 새로운 구글 유저 생성
        const newUser = await userService.createSocialUser(
            {
                email,                  // 구글에서 제공하는 이메일 저장
                name: profile.displayName, // 구글에서 제공하는 이름 저장
                avatar: profile.photos?.[0]?.value, // 구글에서 제공하는 프로필 사진 저장
                address: '', // 구글에서 주소 정보는 제공하지 않으므로 빈 문자열로 초기화
                provider: 'google' // 로그인 방식 구분 위해 provider 필드에 'google' 저장
            });
        return done(null, newUser);// 새로 생성된 구글 유저로 로그인

    } catch (err) {
        return done(err);
    }
}));

// 네이버 전략 추가
passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: '/auth/naver/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.email;
        let user = await userService.findUserByEmail(email);

        if (user) return done(null, user);
        const newUser = await userService.createSocialUser({
            email,
            name: profile.name,
            avatar: profile.profileImage,
            address: '', // 네이버에서 주소 정보는 제공하지 않으므로 빈 문자열로 초기화
            provider: 'naver'  // ← 이것만 다름
        });
        return done(null, newUser);

    } catch (err) {
        return done(err);
    }
}));

// 세션에 사용자 정보 저장(로그인 성공 시 호출) - 한 번만 실행됨, 쿠키로 클라이언트에 세션 ID 저장
// 쿠키 이름 : connect.sid (express-session에서 기본적으로 사용하는 쿠키 이름)
passport.serializeUser((user, done) => {
    done(null, user._id);// 사용자 ID를 세션에 저장(null은 에러, user._id는 세션에 저장할 정보)
});

// 로그인 후 요청이 들어올 때마다 세션에서 사용자 ID를 꺼내서 사용자 정보를 DB에서 조회하여 req.user에 저장(매 요청마다 실행됨)
// 쿠키에 저장된 세션 ID를 통해 세션에서 사용자 ID를 꺼내고, DB에서 해당 ID로 사용자 정보를 조회하여 req.user에 저장
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userService.findUserById(id);
        done(null, user);// 세션에서 사용자 정보 불러오기
    } catch (err) {
        done(err);
    }
});

module.exports = passport;