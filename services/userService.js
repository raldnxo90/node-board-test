//서비스는 비즈니스 로직을 처리하는 역할
//비즈니스 로직: DB에서 데이터 처리, 외부 API 연동, 복잡한 계산 등
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

//회원가입 서비스
async function createUser({ email, password, name, address, file }) {

    //비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    //saltRounds: 해싱 알고리즘의 복잡도를 결정하는 값, 10은 적절한 수준으로 보안과 성능의 균형을 맞춤

    // 프로필 이미지 처리 (업로드된 파일이 있는 경우)
    const profileImage = file
        ? file.filename
        : 'default-profile.png';

    //새 사용자 생성
    const newUser = new User({
        email,
        password: hashedPassword,
        name,
        address,
        profileImage
    });

    await newUser.save();
}

// 이메일로 유저 찾기 (passport 로그인 시 사용)
const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

// ID로 유저 찾기 (passport 세션 복원 시 사용)
const findUserById = async (id) => {
    return await User.findById(id);
};

// 중복 확인 서비스
async function checkEmailAvailability(email) {
    const user = await User.findOne({ email });
    return !user; // 없으면 true (사용 가능)
}

//회원정보 수정 서비스
async function updateUser(userId, { password, name, address, file }) {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const error = new Error('사용자를 찾을 수 없습니다.');
        error.status = 404;
        throw error;
    }
    const user = await User.findById(userId);

    /*
    - 404 테스트 코드
    const error = new Error('사용자를 찾을 수 없습니다.');
    error.status = 404;
    throw error;
    */

    // 소셜 회원 수정 차단
    if (user.provider !== 'local') {
        const error = new Error('소셜 로그인 회원은 정보 수정이 불가능합니다.');
        error.status = 403;//권한 없음
        throw error;
    }
    user.password = await bcrypt.hash(password, 10);

    const updatedUser = {
        name: name || user.name,
        address: address || user.address,
        profileImage: file ? file.filename : user.profileImage
    }
    await User.findByIdAndUpdate(userId, updatedUser);
}

// 회원탈퇴 서비스
async function deleteUser(userId, password) {

    const user = await User.findById(userId);
    if (!user) {
        const error = new Error('사용자를 찾을 수 없습니다.');
        error.status = 404;// 404: Not Found, 요청한 리소스를 찾을 수 없음을 나타냄
        throw error;
    }

    // 로컬 회원만 비밀번호 확인 후 탈퇴 처리, 소셜 회원은 바로 탈퇴 처리
    if (user.provider === 'local') {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('비밀번호가 일치하지 않습니다');
            error.status = 400;// 400: Bad Request, 클라이언트의 요청이 잘못되었음을 나타냄 (예: 유효하지 않은 입력)
            throw error;
        }
    }
    await User.findByIdAndDelete(userId);
}

// 구글 ID로 로컬 유저 찾기 (구글 로그인 시 계정 연동 위해 사용)
// const findUserByGoogleId = async (googleId) => {
//     return await User.findOne({ googleId });
// };


// // 구글 신규 유저 생성
// const createGoogleUser = async ({ googleId, email, name, avatar }) => {
//     const newUser = new User({
//         googleId,
//         email,
//         name,
//         profileImage: avatar || 'default-profile.png',
//         provider: 'google' // provider 필드에 'google' 저장하여 구글 로그인 유저임을 명시
//     });

//     await newUser.save();
//     return newUser;
// };

// 소셜 유저 생성
const createSocialUser = async ({ email, name, avatar, provider }) => {
    const newUser = new User({
        email,
        name,
        profileImage: avatar || 'default-profile.png',
        provider  // 'google' | 'naver' | 'kakao'
    });
    await newUser.save();
    return newUser;
};

module.exports = { createUser, findUserByEmail, findUserById, checkEmailAvailability, updateUser, deleteUser, createSocialUser };