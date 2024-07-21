import { config } from "./config/index.js"
import { user } from "./lib/auth.js"
import { getStatus, lock, unlock } from "./lib/mikrotik.js"

import { Telegraf, Markup } from "telegraf"

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: 'logs/telegrambot.log',
      })
],
});

const bot = new Telegraf(config.API_KEY_BOT)

// START and Auth
bot.start( async (ctx) => {
    const commands = [
        {
            command: "start",
            description: config.dict.startDescription
        },
        {
            command: "help",
            description: config.dict.helpDescription
        }
    ]
    await bot.telegram.setMyCommands(commands)  
    const checkUser = user(ctx.from.id)
    if(checkUser) {
        ctx.replyWithHTML(config.dict.chooseAction, Markup.keyboard([["❌ Lock", "✅ Unlock"],["💢 Status"]]))
        logger.info(`Allowed access /start > Telegram ID: ${ctx.from.id}, Firstname: ${ctx.from.first_name}, Lastname: ${ctx.from.last_name}`);
    } else {
        ctx.replyWithHTML(config.dict.accessDenied, Markup.keyboard([config.dict.btnRequestAccess]).resize())
        logger.warn(`Access denied on /start > Telegram ID: ${ctx.from.id}, Firstname: ${ctx.from.first_name}, Lastname: ${ctx.from.last_name}`);
    }
})

// HELP
bot.command("help", (ctx) => {
    ctx.replyWithHTML(config.dict.help)
    logger.info(`/help > Telegram ID: ${ctx.from.id}, Firstname: ${ctx.from.first_name}, Lastname: ${ctx.from.last_name}`);

})

// LOCK SYSTEM FUNCTIONS
bot.hears("❌ Lock", (ctx) => {
    const checkUser = user(ctx.from.id)
    if(checkUser) {
        logger.info(`❌ Lock > Telegram ID: ${ctx.from.id}, Firstname: ${ctx.from.first_name}, Lastname: ${ctx.from.last_name}`);
        ctx.replyWithHTML(
            "<b>Confirm</b>\nAre you sure to Lock?", 
            Markup.inlineKeyboard([
                Markup.button.callback("Yes", "doLock"), 
                Markup.button.callback("No", "cancelLock")
            ]))
    } else {
        ctx.replyWithHTML(config.dict.accessDenied, Markup.keyboard([config.dict.btnRequestAccess]).resize())
    }
})
bot.action("doLock", (ctx) => {
        const oldText = ctx.callbackQuery.message.text
        lock().then(async (d) => {
            if(d.status == 'ok'){
                await ctx.editMessageText(oldText + '\n\nSystem is Locked!!!')
                logger.info(`❌ Locked > Telegram ID: ${ctx.from.id}, Firstname: ${ctx.from.first_name}, Lastname: ${ctx.from.last_name}`);
            }
        })
})
bot.action("cancelLock", async (ctx) => {
    const oldText = ctx.callbackQuery.message.text
    await ctx.editMessageText(oldText + '\n\nLock process cancelled by you!!!')
})

// UNLOCK SYSTEM FUNCTIONS
bot.hears("✅ Unlock", (ctx) => {
    const checkUser = user(ctx.from.id)
    if(checkUser) {
        ctx.replyWithHTML(
            "<b>Confirm</b>\nAre you sure to Unlock?", 
            Markup.inlineKeyboard([
                Markup.button.callback("Yes", "doUnlock"), 
                Markup.button.callback("No", "cancelUnlock")
            ]))
            logger.info(`✅ Unlock > Telegram ID: ${ctx.from.id}, Firstname: ${ctx.from.first_name}, Lastname: ${ctx.from.last_name}`);
    } else {
        ctx.replyWithHTML(config.dict.accessDenied, Markup.keyboard([config.dict.btnRequestAccess]).resize())
    }
})
bot.action("doUnlock", async (ctx) => {
        const oldText = ctx.callbackQuery.message.text
        unlock().then(async(d) => {
            if(d.status == "ok"){
                await ctx.editMessageText(oldText + '\n\nSystem is Unlocked!!!')
                logger.info(`✅ Unlocked > Telegram ID: ${ctx.from.id}, Firstname: ${ctx.from.first_name}, Lastname: ${ctx.from.last_name}`);
            }
        })
})
bot.action("cancelUnlock", async (ctx) => {
    const oldText = ctx.callbackQuery.message.text
    await ctx.editMessageText(oldText + '\n\nUnlock process cancelled by you!!!')
})

// GET STATUS
bot.hears("💢 Status", (ctx) => {
    const checkUser = user(ctx.from.id)
    if(checkUser) {
        getStatus().then(d => {
            if(d.status == "ok") {
                ctx.replyWithHTML(`<b>Firewall Status for Services</b>\n${d.isHttpDisabled ? "❌" : "✅"} http\n${d.isHttpsDisabled ? "❌" : "✅"} https\n${d.isRdsUdpDisabled ? "❌" : "✅"} RDS-udp`)
                logger.info(`💢 Status > Telegram ID: ${ctx.from.id}, Firstname: ${ctx.from.first_name}, Lastname: ${ctx.from.last_name}. Firewall Status for Services: ${d.isHttpDisabled ? "❌" : "✅"} - http, ${d.isHttpsDisabled ? "❌" : "✅"} - https, ${d.isRdsUdpDisabled ? "❌" : "✅"} - RDS-udp`);
            } else {
                ctx.replyWithHTML(`<b>ERROR OCCURS</b>\n\nThe reason might be too quickly sending request.\nSolution: Please tap only once and wait few seconds. Please be patient. \n\nError message: ${d.error}`)
                logger.error(`💢 Status > Telegram ID: ${ctx.from.id}, Firstname: ${ctx.from.first_name}, Lastname: ${ctx.from.last_name}`);
            }
        })
    } else {
        ctx.replyWithHTML(config.dict.accessDenied, Markup.keyboard([config.dict.btnRequestAccess]).resize())
    }
})


// SEND REQUEST TO ADMIN
bot.hears(config.dict.btnRequestAccess, (ctx) => {
    console.log(ctx.from)
    ctx.replyWithHTML(`Send request to admin with your detail?\n\n<b>Details:</b>\nTelegram ID: ${ctx.from.id}\nLast Name: ${ctx.from.last_name}\nFirst Name: ${ctx.from.first_name}\nUsername: ${ctx.from.username}`, Markup.inlineKeyboard([
        Markup.button.callback("Yes", "sendRequestToAdmin"),
        Markup.button.callback("No", "cancelSendRequest")
    ]))
}) 
bot.action("sendRequestToAdmin", async (ctx) => {
    const oldText = ctx.callbackQuery.message.text
    await ctx.editMessageText(oldText + '\n\nRequest send to Admin')
})
bot.action("cancelSendRequest", async (ctx) => {
    const oldText = ctx.callbackQuery.message.text
    await ctx.editMessageText(oldText + '\n\nSend request canceled by you!')
})

// Start Telegraf Bot
bot.launch().then(() => console.log('Started'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));