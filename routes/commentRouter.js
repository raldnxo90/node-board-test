const express = require('express');
const router = express.Router();
const { createComment, deleteComment } = require('../controller/commentController');

router.post('/:boardId', createComment);       // 댓글 작성
router.post('/delete/:commentId', deleteComment); // 댓글 삭제

module.exports = router;