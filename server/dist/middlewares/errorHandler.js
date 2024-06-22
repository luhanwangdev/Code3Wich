const sendError = (err, req, res) => {
    const { message, statusCode } = err;
    res.json({ error: { statusCode, message } });
};
const globalErrorHandlerMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    sendError(err, req, res);
    console.log(err);
    console.log("--------------------------------------------------------------------------------------");
};
export default globalErrorHandlerMiddleware;
