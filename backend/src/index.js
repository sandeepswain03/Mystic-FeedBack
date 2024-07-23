import connectDB from "./db/index.js";
import logger from "./utils/logger.js";
import app from "./app.js";
import dotenv from "dotenv";
import chalk from "chalk";
dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            logger.info(
                chalk.green.bold.italic(
                    `Server started on port ${process.env.PORT}`
                )
            );
        });
    })
    .catch((error) => {
        logger.error(chalk.red.bold.italic(error));
        process.exit(1);
    });
