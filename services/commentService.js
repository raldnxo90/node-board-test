const Board = require('../models/Board');
const Comment = require('../models/Comment');

// 댓글 조회
const getCommentsByBoardId = async (boardId, page = 1) => {
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalComments = await Comment.countDocuments({ board: boardId });
    const totalCommentPages = Math.max(1, Math.ceil(totalComments / limit));

    const comments = await Comment.find({ board: boardId })
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return { comments, totalCommentPages, currentCommentPage: page };
};

// 댓글 작성
const createComment = async ({ content, author, boardId }) => {
    try {
        const newComment = new Comment({
            content,
            author,
            board: boardId,
        });
        await newComment.save();// 댓글 저장
        
        // 댓글 작성 후 게시글 작성자에게 알림 전송
        const boardAuthor = await Board.findById(boardId).populate('author');// 댓글을 단 게시글의 작성자 정보 조회
        return boardAuthor.author._id;// 게시글 작성자의 ID 반환

    } catch (err) {
        console.error(err);
        throw new Error('댓글 작성 실패');
    }
};

// 댓글 삭제
const deleteComment = async ({ commentId, userId }) => {
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new Error('댓글을 찾을 수 없습니다.');
    }
    if (comment.author.toString() !== userId.toString()) {
        const error = new Error('권한 없음');
        error.status = 403;
        throw error;
    }
    await Comment.findByIdAndDelete(commentId);
};

module.exports = {
    getCommentsByBoardId,
    createComment,
    deleteComment,
};

