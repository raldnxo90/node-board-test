const commentService = require('../services/commentService');
const NotificationService = require('../services/notificationService');
const { emitToUser } = require('../config/socket');

// 댓글 작성
const createComment = async (req, res, next) => {
    try {
        const { content } = req.body;
        const boardId = req.params.boardId;
        const author = req.user._id;
        // await commentService.createComment({ content, author, boardId });

        console.log('boardId:', boardId);
        const boardAuthorId = await commentService.createComment({ content, author, boardId });

        // 자기 자신에게는 알림 안 보내도록 추가
        if (boardAuthorId.toString() !== author.toString()) {
            await NotificationService.createNotification({
                receiver: boardAuthorId,
                message: '새 댓글이 달렸습니다!',
                boardId: boardId,
            });
            emitToUser(boardAuthorId, 'newComment', { message: '새 댓글이 달렸습니다!' , boardId: boardId });
        }

        // 댓글 작성 후 원래 게시글로 리다이렉트
        res.redirect(`/board/info/${boardId}`);
    } catch (err) {
        console.error(err);
        next(err);
    }
};

// 댓글 삭제
const deleteComment = async (req, res, next) => {
    try {

        await commentService.deleteComment({ commentId: req.params.commentId, userId: req.user._id });
        // 댓글 삭제 후 원래 게시글로 리다이렉트
        res.redirect(`/board/info/${req.body.boardId}`);

    } catch (err) {
        next(err);
    }
};

module.exports = { createComment, deleteComment };