class apiResponse {
    constructor(
        statusCode,
        data,
        isAcceptingMessages = false,
        message = "success",
        messages = []
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.isAcceptingMessages = isAcceptingMessages;
        this.messages = messages;
    }
}

export default apiResponse;
