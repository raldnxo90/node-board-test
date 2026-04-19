const express = require('express');
const boardController = require('../controller/boardController');
const router = express.Router();

router.get('/', async (req, res) => {
    const mainBoards = await boardController.getMainBoards();
    res.render('index', { title: '메인 페이지', mainBoards});
});

module.exports = router;

