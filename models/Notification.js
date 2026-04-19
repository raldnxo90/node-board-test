const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 알림 수신자
    message: { type: String, required: true },  // 알림 내용
    isRead: { type: Boolean, default: false },   // 읽음 여부
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', default: null }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;