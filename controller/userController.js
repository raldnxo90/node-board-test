//컨트롤러는 클라이언트의 요청을 처리하고, 적절한 응답을 반환하는 역할
// controllers/userController.js
const userService = require('../services/userService');
const boardService = require('../services/boardService');

// # 회원가입 페이지
const getJoin = (req, res) => {
    res.render('user/join', {
        errors: null,
        formData: {},
        // errors: 유효성 검사 오류 메시지 전달, formData: 폼에 입력한 데이터를 다시 렌더링할 때 사용(유효성 검사 실패 시 입력한 데이터 유지)
    });
};

// # 회원가입 처리
const postJoin = async (req, res, next) => {
    const { email, password, name, address } = req.body;
    // 유효성 검사 통과 시 회원가입 처리
    try {
        await userService.createUser({ email, password, name, address, file: req.file });
        res.redirect('/user/login');

    } catch (error) {
        console.error('회원가입 실패:', error);
        next(error); // 에러 미들웨어로 넘겨 500 페이지 렌더링
    }
};
/*
미들웨어의 필요성
const postJoin = async (req, res) => {
    try {
        await userService.createUser(...);
        res.redirect('/user/login');
    } catch (error) {
        // 에러 처리를 여기서 직접 다 해야 함
        console.error(`[${req.method}] ${req.originalUrl}`);
        console.error(error.stack);

        const statusCode = error.status || 500;
        const message = error.message || '서버 오류가 발생했습니다.';

        if (statusCode === 404) {
            return res.status(404).render('error/404', { statusCode, message });
        }
        if (statusCode === 403) {
            return res.status(403).render('error/403', { statusCode, message });
        }
        res.status(500).render('error/500', { statusCode, message });
    }
};
*/

// 중복확인
const checkEmail = async (req, res, next) => {
    const { email } = req.query;

    try {
        const available = await userService.checkEmailAvailability(email);
        // available(발음: 어베일러블)
        res.json({ available });
    } catch (err) {
        console.error('이메일 중복 확인 실패:', err);
        next(err); // 에러 미들웨어로 넘겨 500 페이지 렌더링
    }
};

// 로그인 페이지
const getLogin = (req, res) => {
    // 로그인 실패 시 passport가 세션에 넣은 메시지 꺼내기
    const messages = req.session.messages || [];
    // 로그인 실패 시 passport가 세션에 넣은 메시지 배열
    // (passport.js: 인증 실패 시 done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' })에서 설정)
    // 로그인 실패할 때마다 세션에 메시지가 추가되므로, 가장 최근 메시지를 꺼내서 로그인 페이지에 전달
    // 없으면 빈 배열
    const errorMessage = messages[messages.length - 1] || null;
    // 로그인 페이지 렌더링 시 에러 메시지 전달, 로그인 실패 시 세션에 저장된 메시지 초기화
    req.session.messages = []; // 메시지 초기화

    res.render('user/login', { errorMessage });
};

// 로그아웃
const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};

// 마이페이지
const getInfo = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect('/user/login');
    const page = parseInt(req.query.page) || 1;
    const userId = req.user.id; // 로그인한 사용자의 ID

    try {
        const { boards, totalPages, currentPage } = await boardService.getBoardsByUserId(userId, page);
        res.render('user/info', { boards, currentPage, totalPages });
    } catch (error) {
        next(error);
    }
};

// 회원정보 수정 페이지
const getModify = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/user/login');
    }
    res.render('user/modify', { errors: null });
};

// 회원정보 수정 처리
const postModify = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/user/login');
    }
    // 회원정보 수정
    const { password, name, address } = req.body;
    try {
        await userService.updateUser(req.user.id, { password, name, address, file: req.file });
        res.redirect('/user/info');
    } catch (error) {
        next(error);
    }
};

// 회원탈퇴 페이지
const getDelete = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/user/login');
    }
    res.render('user/delete', { user: req.user, errors: null });
};

// 회원탈퇴 처리
const postDelete = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/user/login');
    }

    const { password } = req.body;

    try {
        await userService.deleteUser(req.user.id, password);// DB에서 회원 삭제
        req.logout(); // 세션에서 사용자 정보 제거
        res.redirect('/'); // 홈으로 리다이렉트
    } catch (error) {
        res.render('user/delete', {
            user: req.user,
            errors: { password: error.message },
        });
    }
};

module.exports = { getJoin, postJoin, getLogin, logout, checkEmail, getInfo, getModify, postModify, getDelete, postDelete };