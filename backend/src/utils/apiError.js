class apiError extends Error {
    constructor(stautsCode, message = "Something went wrong") {
        super(message);
        this.stautsCode = stautsCode;
        this.messgae = message;
        this.data = null;
    }
}

export default apiError