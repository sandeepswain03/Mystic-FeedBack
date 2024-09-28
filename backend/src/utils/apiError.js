class apiError extends Error {
    constructor(statusCode, message = "Something went wrong") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
    }
}

export default apiError