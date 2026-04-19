const notificationService = require('../services/notificationService');

// 안읽은 알림 조회
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const notifications = await notificationService.getNotifications(userId);
        res.json(notifications);
    } catch (err) {
        next(err);
    }
};

// 전체 읽음 처리
const readNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;
        await notificationService.readNotifications(userId);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// 전체 삭제
const deleteNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;
        await notificationService.deleteNotifications(userId);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

module.exports = { getNotifications, readNotifications, deleteNotifications };