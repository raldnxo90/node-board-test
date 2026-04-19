const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    category: {
        type: String,
        enum: ['free', 'study', 'suggestion', 'counsel'],
        //enum: 열거형, 속성에 허용되는 값들을 제한
        default: 'free',
        required: true
    }, 
    file: {
        type: String,
        default: null
    }, // 업로드된 파일명 저장 (없으면 null)
}, { timestamps: true });

const Board = mongoose.model('Board', boardSchema);
module.exports = Board;