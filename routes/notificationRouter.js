const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

router.get('/', notificationController.getNotifications);       // 알림 조회(안읽은 알림)
router.patch('/read', notificationController.readNotifications); // 읽음 처리
router.delete('/', notificationController.deleteNotifications);  // 전체 삭제

module.exports = router;