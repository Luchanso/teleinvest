// import * as Bot from './bot';
// import * as Invest from './invest';
import Dotenv from 'dotenv';
import Telegraf from 'telegraf';
import Session from 'telegraf/session';
import Finance from 'yahoo-finance';

import { watchSymbols, watchList } from './db';
import { start } from './invest/start';
import { middleware as logMiddleware } from './invest/logger';
import { help } from './invest/help';
import { listFunc, listTriggers } from './invest/list';
import { remove, removeTriggers } from './invest/remove';
import { get, getTriggers } from './invest/get';
import {
  watch,
  triggers as watchTriggers,
  confirmationWatch,
  confirmationTriggers,
} from './invest/watch';

Dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const { log } = console;

bot.start(start);

bot.use(Session());
bot.use(logMiddleware);

bot.command('help', help);

bot.hears(watchTriggers, watch);
bot.hears(confirmationTriggers, confirmationWatch);
bot.hears(listTriggers, listFunc);
bot.hears(removeTriggers, remove);
bot.hears(getTriggers, get);

setInterval(() => {
  const users = Object.values(watchList);
  const symbols = Object.keys(watchSymbols);

  if (users.length === 0 || symbols.length === 0) return;
  log('Update watch list');

  Finance.quote(
    {
      symbols,
      modules: ['price'],
    },
    (err, quotes) => {
      if (err) {
        log(err);
        return;
      }

      Object.keys(quotes).forEach((symbol) => {
        watchSymbols[symbol] = {
          ...watchSymbols[symbol],
          lastPrice: quotes[symbol].price.regularMarketPrice,
        };
      });

      users.forEach((user) => {
        Object.keys(watchList[user]).forEach((symbol) => {
          const prices = watchList[user][symbol];

          prices.forEach((price) => {
            if (watchSymbols[symbol].lastPrice > price) {
              bot.sendMessage(user, `--- ALERT --- \n ${symbol} get price ${symbol}`);
            }
          });
        });
      });
    },
  );
}, 6e4);

bot.startPolling();
