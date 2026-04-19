// 1. 환경변수 (가장 먼저 - 다른 모든 것들이 env 값 필요)
require('dotenv').config();

// 2. 패키지 import (사용할 것들 불러오기)
const express = require('express');
const connectDB = require('./config/database');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');
const http = require('http'); // HTTP 서버 생성에 사용
const {Server} = require('socket.io');// Socket.IO 서버 클래스, 서버 전체를 관리하는 역할, 클라이언트와의 실시간 통신을 가능하게 함

// 3. 라우터/미들웨어 모듈 import
const userRouter = require('./routes/userRouter');
const boardRouter = require('./routes/boardRouter');
const commentRouter = require('./routes/commentRouter');
const mainRouter = require('./routes/mainRouter');
const authRouter = require('./routes/authRouter'); 
const notificationRouter = require('./routes/notificationRouter');

const {errorHandler, notFoundHandler} = require('./middlewares/errorMiddleware');
const { initSocket } = require('./config/socket');

// 4. app 생성 (이게 있어야 아래 것들 사용 가능)
const app = express();

const httpServer  = http.createServer(app);
// HTTP 서버 생성, Express는 내부적으로 HTTP 서버를 생성해서 요청을 처리하지만, Socket.IO와 통합하려면 명시적으로 HTTP 서버를 생성해서 Express 앱과 연결해야 함, 이렇게 하면 Socket.IO가 HTTP 서버와 같은 포트에서 클라이언트와의 실시간 통신을 처리할 수 있음
const io = new Server(httpServer);
// Socket.IO 서버 생성, HTTP 서버를 인자로 전달해서 Socket.IO가 HTTP 서버와 통합되도록 함, 이렇게 하면 HTTP 서버와 같은 포트에서 클라이언트와의 실시간 통신을 처리할 수 있음
// HTTP 서버를 소켓 서버로 감싸 io 객체 생성, 이렇게 하면 HTTP 서버와 소켓 서버가 같은 포트에서 작동 가능, 클라이언트는 같은 포트로 HTTP 요청과 WebSocket 연결 모두 할 수 있음
// HTTP 요청은 Express가 처리하고(GET, POST), WebSocket 연결(/ws)은 Socket.IO가 처리하는 구조

// 5. DB 연결 (서버 뜨기 전에 연결)
connectDB();

// 6. 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 7. 기본 미들웨어 (요청 파싱 - 라우터보다 먼저)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정 (passport보다 먼저)
app.use(session({
    secret: process.env.SESSION_SECRET,   // 세션 쿠키를 암호화할 때 쓰는 키, 클라이언트가 쿠키를 변조하지 못하도록 하는 역할
    resave: false,      // 세션이 변경되지 않아도 저장할지 여부
    saveUninitialized: false, // 세션이 저장되기 전에 초기화할지 여부 (로그인 안 한 사용자도 세션 저장할지 여부, false로 하면 로그인한 사용자만 세션 저장)
}));

// Passport 초기화 및 세션 사용
app.use(passport.initialize());// passport 초기화 미들웨어, passport의 기능을 사용하기 위해 반드시 필요
app.use(passport.session());// passport 세션 미들웨어, 로그인 상태 유지 위해 필요, 세션에 사용자 정보 저장

// 모든 라우터에서 user 정보 사용 가능하도록 미들웨어 추가
app.use((req, res, next) => {
    res.locals.user = req.user || null;  // 모든 EJS에서 user 변수 사용 가능
    next();
});

// 8. 라우터 등록 (미들웨어 다음)
app.use('/user', userRouter);
app.use('/board', boardRouter);
app.use('/comment', commentRouter);
app.use('/', mainRouter);
app.use('/auth', authRouter); // OAuth 라우터 등록
app.use('/notification', notificationRouter); // 알림 라우터 등록

//9. 에러 핸들러 등록 (라우터 다음 - 모든 라우터에서 처리 못한 요청은 404, 라우터에서 next(err)로 넘긴 에러는 500)
app.use(notFoundHandler); // 404 핸들러
app.use(errorHandler); // 500 핸들러 (404도 여기서 처리)

initSocket(io); // Socket.IO 초기화, 서버 생성 후 이 함수를 호출해서 io 객체 전달

// 10. 서버 시작 (진짜 맨 마지막)
const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`${PORT}에서 서버가 실행 중입니다.`);
// });

httpServer.listen(PORT, () => {
    console.log(`${PORT}에서 서버가 실행 중입니다.`);
});

//환경변수 → import → app생성 → DB → 미들웨어 → 라우터 → 에러핸들러 → listen