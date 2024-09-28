class apiResponse {
    constructor(
        statusCode,
        data,
        message = "success",
        messages = []
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.messages = messages;
    }
}

export default apiResponse;
