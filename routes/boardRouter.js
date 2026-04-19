const express = require('express');
const boardController = require('../controller/boardController');
const { uploadBoard } = require('../config/upload');

const router = express.Router();

// 게시글 작성 페이지
router.get('/write', boardController.getWrite);

// 게시글 작성 처리
router.post('/write', uploadBoard.single('upload_file'), boardController.postWrite);

// 게시글 목록 페이지
router.get('/list/:category', boardController.getList);

// 게시글 상세 페이지
router.get('/info/:id', boardController.getInfo);

// 게시글 수정 페이지
router.get('/modify/:id', boardController.getModify);

// 게시글 수정 처리
router.post('/modify/:id', uploadBoard.single('upload_file'), boardController.postModify);

// 게시글 삭제 페이지
router.get('/delete/:id', boardController.getDelete);

// 게시글 삭제 처리
router.post('/delete', boardController.postDelete);

module.exports = router;
