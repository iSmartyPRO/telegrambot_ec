export const config = {
    API_KEY_BOT: "telegramBotKeyHere",
    mikrotik: {
        host: 'mikrotikHostNameOrIP',
        username: 'amdin',
        privateKeyPath: '/Users/username/.ssh/id_rsa',
        PubkeyAcceptedAlgorithms: 'ssh-rsa'
    },
    users: [
        {
            "id": 123456,
            "name": "identityName",
            "enabled": true,
            "isAdmin": true
        }
    ],
    dict: {
        help: "<b>What is this?</b>\n\nThis bot is remote system locker",
        startDescription: "Start bot",
        helpDescription: "Whats is this?",
        accessDenied: "<b>Access Denied!!!</b>\n\nYou dont have permitions to use this Telegram bot.",
        btnRequestAccess: "Request Access",
        chooseAction: "Choose action by bellow buttons:"
    }
}