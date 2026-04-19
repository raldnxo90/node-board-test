// 컨트롤러는 클라이언트의 요청을 처리하고, 적절한 응답을 반환하는 역할
// 비즈니스 로직(페이징 계산, DB 조회 등)은 서비스에 위임하고
// 컨트롤러는 요청에서 데이터를 꺼내고, 서비스를 호출하고, 결과를 렌더링하는 역할만 담당
const boardService = require('../services/boardService');
const commentService = require('../services/commentService');
const bcrypt = require('bcrypt');

// 게시글 작성 페이지
const getWrite = (req, res) => {
    // 로그인 상태 확인, 비로그인 시 로그인 페이지로 이동
    if (!req.isAuthenticated()) {
        return res.redirect('/user/login');
    }
    res.render('board/write');
};

// 게시글 작성 처리
const postWrite = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/user/login');
    }

    const { title, content, category } = req.body;

    try {
        await boardService.createBoard({
            title,
            content,
            author: req.user.id,  // passport 세션에서 로그인한 유저 ID 가져옴
            category,
            file: req.file,       // multer가 붙여주는 파일 객체 (없으면 undefined)
        });

        // 작성 완료 후 해당 카테고리 게시판으로 이동
        res.redirect(`/board/list/${category}`);

    } catch (error) {
        next(error); // 에러 미들웨어로 넘겨 500 페이지 렌더링
    }
};

// 게시글 목록 페이지 (페이징 포함)
// - URL 예시: /board/list/free?page=2
const getList = async (req, res, next) => {
    const category = req.params.category;
    // 쿼리스트링에서 page를 꺼냄, 없으면 1페이지
    // parseInt: 문자열 "2"를 숫자 2로 변환 (쿼리스트링은 항상 문자열로 들어옴)
    const page = parseInt(req.query.page) || 1;

    try {
        // 페이징 계산(totalPages 등)은 비즈니스 로직이므로 서비스에서 처리
        // 서비스가 { boards, totalPages, currentPage }를 묶어서 반환
        const { boards, totalPages, currentPage } = await boardService.getBoardsByCategory(category, page);

        res.render('board/list', { boards, category, currentPage, totalPages });

    } catch (error) {
        next(error);
    }
};

// 게시글 상세 페이지
const getInfo = async (req, res, next) => {
    const boardId = req.params.id;
    const commentPage = parseInt(req.query.commentPage) || 1;

    try {
        const board = await boardService.getBoardById(boardId);

        // commentPage 전달
        const { comments, totalCommentPages, currentCommentPage } =
            await commentService.getCommentsByBoardId(boardId, commentPage);

        res.render('board/info', {
            board,
            comments,
            totalCommentPages,
            currentCommentPage,
            user: req.user || null,
        });

    } catch (error) {
        next(error);
    }
};

// 게시글 수정 페이지
const getModify = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/user/login');
    }

    try {
        const modifyBoard = await boardService.getBoardById(req.params.id);
        if (!modifyBoard.author.equals(req.user.id)) {
            const error = new Error('권한 없음');
            error.status = 403;
            throw error;
        }
        res.render('board/modify', { boardId: req.params.id, board: modifyBoard });
    } catch (error) {
        next(error);
    }
};

// 게시글 수정 처리
const postModify = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/user/login');
    }
    try {
        await boardService.updateBoard(req.params.id, {
            title: req.body.title,
            content: req.body.content,
            file: req.file, // multer가 붙여주는 파일 객체 (없으면 undefined)
        });
        res.redirect(`/board/info/${req.params.id}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 게시글 삭제 페이지
const getDelete = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/user/login');
    }
    try {
        const deleteBoard = await boardService.getBoardById(req.params.id);
        if (!deleteBoard.author.equals(req.user.id)) {
            const error = new Error('권한 없음');
            error.status = 403;
            throw error;
        }
        res.render('board/delete', { board: deleteBoard, error: null });
    } catch (error) {
        next(error);
    }
};

// 게시글 삭제 처리
const postDelete = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/user/login');
    }
    try {
        const boardId = req.body.boardId;
        const password = req.body.password;
        const isMatch = await bcrypt.compare(password, req.user.password);
        if (!isMatch) {
            res.render('board/delete', {
                board: await boardService.getBoardById(boardId),
                error: '비밀번호가 일치하지 않습니다.'
            });
            return;
        }
        await boardService.deleteBoard(boardId);
        res.redirect(`/board/list/${req.body.category}`); // 삭제 후 자유 게시판으로 이동 (카테고리에 따라 다르게 리다이렉트할 수도 있음)
    } catch (error) {
        next(error);
    }
};

// 메인 페이지용 게시글 조회 (카테고리 상관없이 최신 게시글 6개)
const getMainBoards = async (req, res, next) => {
    try {
        const mainBoards = await boardService.getMainBoards();
        return mainBoards;
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getWrite,
    postWrite,
    getList,
    getInfo,
    getModify,
    postModify,
    getDelete,
    postDelete,
    getMainBoards,
};