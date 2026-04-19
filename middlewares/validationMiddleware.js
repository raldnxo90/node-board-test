// 유효성 검사 미들웨어
const { body, validationResult } = require('express-validator');

//#1 회원가입 유효성 검사 규칙
const joinValidationRules = [
    body('email')
        .isEmail().withMessage('유효한 이메일 주소를 입력해주세요.')
        .notEmpty().withMessage('이메일은 필수 입력 항목입니다.')
        .normalizeEmail(), // 이메일 주소를 소문자로 변환하여 저장
    body('password')
        .notEmpty().withMessage('비밀번호는 필수입니다')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('비밀번호는 영문, 숫자, 특수문자 조합 8자 이상이어야 합니다'),
    body('name')
        .notEmpty().withMessage('이름은 필수입니다')
        .matches(/^[가-힣]{2,5}$/)
        .withMessage('이름은 2~5자의 한글로 입력해주세요'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('비밀번호가 일치하지 않습니다');
            }
            return true;
        })
];

//#2 회원 정보 수정 유효성 검사 규칙
const modifyValidationRules = [
    body('password')
        .notEmpty().withMessage('비밀번호는 필수입니다')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('비밀번호는 영문, 숫자, 특수문자 조합 8자 이상이어야 합니다'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('비밀번호가 일치하지 않습니다');
            }
            return true;
        })
];

// 검증 결과 처리 미들웨어
const validate = (view) => (req, res, next) => {
    const errors = validationResult(req);
    // validationResult: express-validator에서 제공하는 함수로, 요청(req)에서 유효성 검사 결과를 추출하여 반환

    if (!errors.isEmpty()) {
        req.validateErrors = {};// 유효성 검사 실패 시 반환된 오류 메시지를 저장할 객체
        errors.array().forEach(err => {
            req.validateErrors[err.path] = err.msg;// 유효성 검사 실패 시 반환된 오류 메시지를 필드 이름을 키로 하는 객체에 저장(ex: { email: '이메일은 필수 입력 항목입니다.', password: '비밀번호는 필수입니다', ... })
        });
        res.render(view, { errors: req.validateErrors });// 유효성 검사 실패 시 지정된 뷰를 렌더링하면서 오류 메시지를 전달
    } else {
        return next();// 유효성 검사 통과 시 다음 미들웨어로 이동
    }
}

module.exports = { joinValidationRules, modifyValidationRules, validate };

/*
    정규식: 특정한 규칙을 가진 문자열의 집합을 표현하는 데 사용되는 패턴
    ^: 문자열의 시작
    (?=..): 전방탐색: 규칙에 맞지 않는 문자열이 포함되어도 검증이 실패하지 않도록 하는 패턴(모든 조건이 충족되는지 확인)
        [a-zA-Z]: 영문자 대소문자
        \d: 숫자
        [@$!%*?&]: 특수문자
        [가-힣]: 한글 문자 범위
    {8,}: 8자 이상
    $: 문자열의 끝
*/