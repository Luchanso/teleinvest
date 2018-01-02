// import * as Bot from './bot';
// import * as Invest from './invest';
import Dotenv from 'dotenv';
import Telegraf from 'telegraf';
import Session from 'telegraf/session';

import { start } from './invest/start';
import { middleware as logMiddleware } from './invest/logger';
import { help } from './invest/help';
import { listFunc, listTriggers } from './invest/list';
import { remove, removeTriggers } from './invest/remove';
import { get, getTriggers } from './invest/get';
import { check } from './invest/check';
import {
  watch,
  triggers as watchTriggers,
  confirmationWatch,
  confirmationTriggers,
} from './invest/watch';

Dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);
const checkInterval = 5 * 6e4; // 5 min

bot.start(start);

bot.use(Session());
bot.use(logMiddleware);

bot.command('help', help);

bot.hears(watchTriggers, watch);
bot.hears(confirmationTriggers, confirmationWatch);
bot.hears(listTriggers, listFunc);
bot.hears(removeTriggers, remove);
bot.hears(getTriggers, get);

setInterval(check, checkInterval);

bot.startPolling();
