// 서비스는 비즈니스 로직을 처리하는 역할
// 비즈니스 로직: DB에서 데이터 처리, 외부 API 연동, 복잡한 계산 등
// 컨트롤러는 요청/응답만 처리하고, 실제 데이터 처리는 서비스에 위임

const mongoose = require('mongoose');
const Board = require('../models/Board');

// 게시글 작성 서비스
async function createBoard({ title, content, author, category, file }) {

    // 파일이 있으면 multer가 저장한 파일명(file.filename)을 사용, 없으면 null
    const boardFile = file ? file.filename : null;

    const newBoard = new Board({
        title,
        content,
        author,
        category,
        file: boardFile,
    });

    await newBoard.save();
    return newBoard;
}

// 카테고리별 게시글 목록 조회 서비스 (페이징 포함)
// - page: 현재 페이지 번호 (기본값 1)
// - limit: 페이지당 게시글 수 (기본값 10)
// - 반환값: { boards, totalPages, currentPage }
async function getBoardsByCategory(category, page) {

    const limit = 10; // 페이지당 게시글 수
    // 페이징 계산은 데이터 처리 로직이므로 서비스에서 담당
    const skip = (page - 1) * limit; // 건너뛸 게시글 수 (예: 2페이지면 10개 건너뜀)
    const totalBoards = await Board.countDocuments({ category: category }); // 전체 게시글 수
    const totalPages = Math.ceil(totalBoards / limit); // 전체 페이지 수 (올림 처리)

    const boards = await Board.find({ category: category })
        .populate('author', 'name') // author 필드를 User 컬렉션에서 name만 가져와 채움
        .sort({ createdAt: -1 })    // 최신순 정렬
        .skip(skip)                 // 앞의 게시글 건너뜀
        .limit(limit);              // 페이지당 개수만큼 가져옴

    // 컨트롤러에서 필요한 페이징 정보를 함께 반환
    return { boards, totalPages, currentPage: page };
}

// 게시글 상세 조회 서비스
const getBoardById = async (boardId) => {
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
        //isValid 메서드는 주어진 문자열이 유효한 MongoDB ObjectId 형식인지 검사하는 역할, 유효하지 않으면 404 처리
        const err = new Error('게시글을 찾을 수 없습니다.');
        err.status = 404;
        throw err;
    }
    const board = await Board.findById(boardId)
        .populate('author', 'name'); // 작성자 정보도 함께 가져오기

    if (!board) {
        const err = new Error('게시글을 찾을 수 없습니다.');
        err.status = 404;
        throw err;
    }// 게시글이 존재하면 해당 게시글 반환, 없으면 404 에러

    return board;
};

// 메인 페이지용 최신 게시글 조회 서비스
// - 카테고리 무관, 최신 6개만 가져옴
async function getMainBoards() {
    const mainBoards = await Board.find({})
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .limit(6);
    return mainBoards;
}

// 특정 사용자의 게시글 목록 조회 서비스 (마이페이지용, 페이징 포함)
// - 반환값: { boards, totalPages, currentPage }
async function getBoardsByUserId(userId, page = 1, limit = 10) {

    const skip = (page - 1) * limit;
    const totalBoards = await Board.countDocuments({ author: userId }); // 해당 유저의 전체 게시글 수
    const totalPages = Math.ceil(totalBoards / limit);

    const boards = await Board.find({ author: userId })
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return { boards, totalPages, currentPage: page };
}

// 게시글 수정 서비스
async function updateBoard(boardId, { title, content, file }) {
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
        //isValid 메서드는 주어진 문자열이 유효한 MongoDB ObjectId 형식인지 검사하는 역할, 유효하지 않으면 404 처리
        const error = new Error('게시글을 찾을 수 없습니다.');
        error.status = 404;
        throw error;
    }
    const board = await Board.findById(boardId).populate('author', 'name');
    if (!board) {
        const error = new Error('게시글을 찾을 수 없습니다.');
        error.status = 404;
        throw error;
    }// 게시글 작성자와 로그인한 유저가 다르면 403 에러

    const updateBoard = {
        title,
        content,
    };

    // 파일이 있으면 업데이트 데이터에 file 필드 추가
    if (file) {
        updateBoard.file = file.filename;
    }

    await Board.findByIdAndUpdate(boardId, updateBoard);
}

// 게시글 삭제 서비스
async function deleteBoard(boardId) {

    if (!mongoose.Types.ObjectId.isValid(boardId)) {
        const error = new Error('게시글을 찾을 수 없습니다.');
        error.status = 404;
        throw error;
    }
    await Board.findByIdAndDelete(boardId);
}

module.exports = {
    createBoard,
    getBoardsByCategory,
    getBoardById,
    getMainBoards,
    getBoardsByUserId,
    updateBoard,
    deleteBoard,
};

