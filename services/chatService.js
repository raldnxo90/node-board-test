const Message = require('../models/Message');

const getMessages = async (roomId) => {
    try {
        return await Message.find({ roomId }).sort({ createdAt: 1 }).limit(50).lean();
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

const saveMessage = async (roomId, sender, message) => {
    try {
        const newMessage = new Message({ roomId, sender, message });
        await newMessage.save();
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getMessages,
    saveMessage
};      