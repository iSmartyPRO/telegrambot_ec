import { config } from "../config/index.js";

export const user = (telegramId) => {
    return config.users.find(el => el.id == telegramId)
}