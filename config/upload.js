// config/upload.js
const multer = require('multer');
//multer: 파일 업로드 처리 라이브러리, multipart/form-data 형식의 요청에서 파일을 추출하여 서버에 저장하는 기능 제공
//multipart/form-data 형식: 파일 업로드를 포함한 폼 데이터를 전송할 때 사용되는 인코딩 방식, 일반적으로 HTML 폼에서 파일을 업로드할 때 사용됨
const path = require('path');

// 공통 파일명 생성 함수
// multer diskStorage의 filename 콜백 형식 → (req, file, cb)
// file.originalname: 원본 파일명 (예: 'photo.jpg')
// path.extname: 확장자 추출 (예: '.jpg')
// Date.now(): 타임스탬프로 파일명 중복 방지 (예: '1714123456789.jpg')
// file: multer가 처리한 파일 객체
// cb: multer가 제공하는 콜백 함수, 첫 번째 인자는 에러(null이면 성공), 두 번째 인자는 저장할 파일명
const makeFilename = (req, file, cb) => {
    const ext = path.extname(file.originalname); // 확장자 추출 (예: .jpg, .png, .pdf)
    cb(null, Date.now() + ext); // 에러 없음(null), 타임스탬프 + 확장자로 파일명 생성
};

// 프로필 이미지 저장 설정
// destination: 파일이 저장될 경로
// filename: 저장될 파일명 (makeFilename 함수 사용)
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/profile'); // 프로필 이미지 저장 경로
    },
    filename: makeFilename
});

// 게시판 첨부파일 저장 설정
// destination: 프로필과 다른 경로에 저장 (board 폴더)
// filename: 동일하게 타임스탬프 + 확장자 사용
const boardStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/board'); // 게시판 첨부파일 저장 경로
    },
    filename: makeFilename
});

// 프로필 이미지 필터
// 이미지 파일만 허용 (jpeg, png, webp)
// cb(null, true)  -> 업로드 허용
// cb(error)       -> 업로드 거부 + 에러 전달
const imageFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // 허용된 이미지 형식 -> 업로드 허용
    } else {
        cb(new Error('이미지 파일만 업로드 가능합니다.')); // 허용되지 않은 형식 -> 업로드 거부
    }
};

// 게시판 첨부파일 필터
// 이미지(jpeg, png, webp) + 문서(pdf, doc, docx) 허용
// 프로필보다 허용 범위가 넓음
const boardFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    //pdf: application/pdf
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('이미지 파일만 업로드 가능합니다.')); // 허용되지 않은 형식 -> 업로드 거부
    }
};

// 프로필 업로드 미들웨어
// storage: 저장 경로 및 파일명 설정
// limits: 최대 파일 크기 5MB (5 * 1024 * 1024 bytes)
// fileFilter: 이미지만 허용
// 사용: uploadProfile.single('profileImage') -> req.file에 파일 정보 저장
const uploadProfile = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB(1024 * 1024 -> 1MB)
    fileFilter: imageFilter
});
//storage: multer.diskStorage()로 설정한 저장 방식과 경로를 사용하여 파일을 저장
//limits: 업로드할 파일의 최대 크기를 설정 (5MB)
//fileFilter: 업로드할 파일의 형식을 검사하여 허용된 형식만 업로드하도록 설정 (이미지 파일만 허용)

// 게시판 첨부파일 업로드 미들웨어
// storage: 게시판용 저장 경로 및 파일명 설정
// limits: 최대 파일 크기 20MB (20 * 1024 * 1024 bytes)
// fileFilter: 이미지 + 문서 허용
// 사용: uploadBoard.single('boardFile') -> req.file에 파일 정보 저장
const uploadBoard = multer({
    storage: boardStorage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: boardFilter
});

module.exports = { uploadProfile, uploadBoard };