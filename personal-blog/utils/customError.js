class CustomError extends Error {
  constructor(statusCode, message, statusText = "fail") {
    super(message);
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}
module.exports = CustomError;