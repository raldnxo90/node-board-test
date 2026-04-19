let _io = null;// io 객체를 저장할 변수
//io 객체: 클라이언트와 실시간 양방향 통신을 가능하게 하는 객체, 서버에서 클라이언트로 이벤트를 보내거나 클라이언트에서 서버로 이벤트를 받을 때 사용
//전체 서버에서 io 객체를 공유하기 위해 전역 변수로 선언

// initSocket 함수: io 객체를 초기화하는 함수, app.js에서 서버 생성 후 이 함수를 호출해서 io 객체를 전달
const initSocket = (io) => {
    // io 객체를 초기화하는 함수, app.js에서 서버 생성 후 이 함수를 호출해서 io 객체를 전달
    _io = io;
    console.log('소켓 서버 초기화 완료');
    io.on('connection', (socket) => {
        // on(): 특정 이벤트가 발생했을 때 실행되는 이벤트 리스너를 등록하는 메서드, 여기서는 'connection' 이벤트에 대한 리스너 등록
        // 클라이언트가 연결되었을 때 실행되는 이벤트 리스너, socket 객체는 연결된 개별적인 클라이언트와의 통신에 사용
        // socket은 각 클라이언트와의 연결을 나타내는 객체로, 클라이언트와 서버 간의 통신을 관리하는 역할을 함
        const user = socket.handshake.auth.user;
        // 클라이언트가 연결할 때 보낸 인증 정보(로그인한 사용자 정보)에서 user 객체를 가져옴
        if (!user) {
            // user 정보가 없으면 연결 종료 (로그인 안 한 사용자는 소켓 연결 못 하도록)
            return socket.disconnect();
        }
        socket.join(`유저: ${user._id}`);
        // join(): 소켓(개별적인 클라이언트)이 특정 룸에 참여하도록 하는 메서드
        socket.data.user = user;
        console.log(`[소켓 연결] 유저: ${socket.data.user.name} / 참여하는 룸: ${[...socket.rooms]}`);
        //socket.rooms는 현재 소켓이 참여하고 있는 룸들의 집합(Set), 기본적으로 소켓은 자신만의 고유한 룸(소켓 ID로 된 룸)에 참여하고 있기 때문에, 여기에 `유저: ${user._id}` 룸이 추가됨, 콘솔 로그로 어떤 유저가 어떤 룸에 참여했는지 확인 가능
    });
};

// emitToUser 함수: 특정 유저에게 이벤트를 보내는 함수, app.js에서 라우터나 서비스에서 이 함수를 호출해서 특정 유저에게 실시간 알림 등을 보낼 때 사용
const emitToUser = (userId, event, data) => {
    console.log(`[이벤트 전송] 유저ID: ${userId} / 이벤트: ${event} / 데이터:`, data);
    const room = _io.sockets.adapter.rooms.get(`유저: ${userId}`);
    // _io.sockets.adapter.rooms는 현재 소켓 서버에 존재하는 모든 룸들의 정보를 담고 있는 Map 객체, get(`유저: ${userId}`)로 특정 유저의 룸이 존재하는지 확인, 해당 유저가 현재 소켓 서버에 연결되어 있지 않으면 room이 존재하지 않음

    if (!room) {
        // 해당 유저가 현재 소켓 서버에 연결되어 있지 않으면 room이 존재하지 않음, 이 경우 이벤트를 보낼 수 없으므로 함수 종료
        return;
    }
    _io.to(`유저: ${userId}`).emit(event, data);
    // to(`유저: ${userId}`)로 특정 유저의 룸을 지정해서 emit(event, data)로 해당 룸에 이벤트와 데이터를 보냄, 이렇게 하면 해당 유저에게 실시간으로 알림 등을 보낼 수 있음
};

module.exports = {
    initSocket,
    emitToUser,
};