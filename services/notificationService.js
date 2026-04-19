const Notification = require('../models/Notification');

// 알림 생성
const createNotification = async ({ receiver, message, boardId }) => {
    const notification = new Notification({ receiver, message, boardId });
    await notification.save();
};

// 안읽은 알림 조회
const getNotifications = async (userId) => {
    return await Notification.find({ receiver: userId, isRead: false })
        .sort({ createdAt: -1 });
};

// 전체 읽음 처리
const readNotifications = async (userId) => {
    await Notification.updateMany({ receiver: userId, isRead: false }, { isRead: true });
};

// 전체 삭제
const deleteNotifications = async (userId) => {
    await Notification.deleteMany({ receiver: userId });
};

module.exports = {
    createNotification,
    getNotifications,
    readNotifications,
    deleteNotifications,
};