// middleware/validate.js
const { validationResult } = require('express-validator');

// 렌더링할 뷰와 추가 데이터를 인자로 받음
const validate = (view, extraData = {}) => (req, res, next) => {
    //view: 유효성 검사 실패 시 렌더링할 뷰
    //extraData: 유효성 검사 실패 시 뷰에 전달할 추가 데이터 (예: 기존 폼 데이터, 사용자 정보 등)
    const result = validationResult(req);
    // validationResult: express-validator에서 제공하는 함수로, 요청(req)에서 유효성 검사 결과를 추출하여 반환
    if (!result.isEmpty()) {// 유효성 검사 실패 시
        const errors = {};// errors 객체 초기화
        result.array().forEach(err => {
            if (!errors[err.path]) {
                errors[err.path] = err.msg;
            }
        });
        return res.render(view, {
            errors,
            formData: req.body,
            ...extraData  // 수정 페이지에서 기존 유저 데이터 등 추가 가능
        });
    }
    next();
};

module.exports = { validate };