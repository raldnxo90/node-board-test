// # 회원가입과 로그인 요청에 대한 유효성 검증을 수행하는 미들웨어

const { body } = require('express-validator');
//body()는 요청 본문에서 특정 필드를 검증하는 데 사용되는 express-validator의 메서드

const joinValidationRules = [
    body('email')
        .isEmail().withMessage('유효한 이메일 주소를 입력해주세요.')
        .notEmpty().withMessage('이메일은 필수 입력 항목입니다.'),
    
    body('password')
        .notEmpty().withMessage('비밀번호는 필수입니다')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('비밀번호는 영문, 숫자, 특수문자 조합 8자 이상이어야 합니다'),
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
    body('name')
        .notEmpty().withMessage('이름은 필수입니다')
        .matches(/^[가-힣]+$/)
        .withMessage('한글 이름만 가입이 가능합니다'),
];
//isEmail()는 입력값이 유효한 이메일 형식인지 검증하는 메서드
//notEmpty()는 입력값이 비어있지 않은지 검증하는 메서드
//matches()는 입력값이 특정 정규식 패턴과 일치하는지 검증하는 메서드
//withMessage()는 검증 실패 시 반환할 오류 메시지를 지정하는 메서드

const modifyValidationRules = [
    body('password')
        .notEmpty().withMessage('비밀번호는 필수입니다')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('비밀번호는 영문, 숫자, 특수문자 조합 8자 이상이어야 합니다'),
    body('name')
        .notEmpty().withMessage('이름은 필수입니다')
        .matches(/^[가-힣]+$/)
        .withMessage('한글 이름만 가입이 가능합니다'),
];

module.exports = { joinValidationRules, modifyValidationRules };