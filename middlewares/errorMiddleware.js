const notFoundHandler = (req, res, next) => {
    const error = new Error('페이지를 찾을 수 없습니다.');
    error.status = 404;
    next(error);
};

const errorHandler = (err, req, res, next) => {
    console.error(`[${req.method}] ${req.originalUrl}`);
    console.error(err.stack);

    const statusCode = err.status || 500; // status가 없으면 500
    const message = err.message || '서버 오류가 발생했습니다.';

    if (statusCode === 404) {
        return res.status(404).render('error/404', { statusCode, message });
    }
    if (statusCode === 403) {
        return res.status(403).render('error/403', { statusCode, message });
    }// 권한이 없는 요청
    res.status(500).render('error/500', { statusCode, message });
};

module.exports = { notFoundHandler, errorHandler };
