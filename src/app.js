// import * as Bot from './bot';
// import * as Invest from './invest';
import Dotenv from 'dotenv';
import Telegraf from 'telegraf';
import Markup from 'telegraf/markup';
import Session from 'telegraf/session';
import Finance from 'yahoo-finance';

Dotenv.config();
const watchList = {};
const watchSymbols = {};
const bot = new Telegraf(process.env.BOT_TOKEN);

const { log } = console;

bot.start((ctx) => {
  log('started:', ctx.from.id);
  return ctx.reply('Welcome!');
});

bot.use(Session());

bot.use((ctx, next) => {
  log('Request', ctx.message);

  return next(ctx);
});

bot.command('help', (ctx) => {
  log(ctx);
  ctx.reply('Example:\r\nWatch ROSN.ME 330.30\r\n');
});

bot.hears(/watch ([\w|.|-]*) ([\d|.]*)/i, (ctx) => {
  ctx.reply('Processing...');

  const symbol = ctx.match[1].toUpperCase();
  const price = Number(ctx.match[2].toLowerCase());

  if (Number.isNaN(price) || !Number.isFinite(price)) {
    ctx.reply('Not correct price format, try 123.23');
    return;
  }

  Finance.quote(
    {
      symbol,
      modules: ['price'],
    },
    (err, quotes) => {
      if (err) {
        ctx.reply('Sorry, bad request');
        ctx.reply(`\`\`\`${JSON.stringify(err, null, 2)}\`\`\``);

        log(err);

        return;
      }

      const { shortName, regularMarketPrice, currencySymbol } = quotes.price;

      ctx.reply(`Now ${symbol} = ${regularMarketPrice}${currencySymbol} ∆${Math.abs(regularMarketPrice - price).toFixed(2)}`);
      ctx.reply(
        `I'll notify you when ${shortName} will be ${price}${currencySymbol} okey?`,
        Markup.keyboard(['yes', 'no'], { columns: 2 })
          .oneTime()
          .resize()
          .extra(),
      );

      ctx.session.isSelect = true;
      ctx.session.symbol = symbol;
      ctx.session.price = price;
      ctx.session.currencySymbol = currencySymbol;
      ctx.session.lastPrice = regularMarketPrice;
    },
  );
});

bot.hears(/^(yes|no)$/, (ctx) => {
  if (!ctx.session.isSelect) return;

  const answer = ctx.match[0];

  if (answer === 'yes') {
    const userData = watchList[ctx.from.id] || {};
    const {
      symbol, price, currencySymbol, lastPrice,
    } = ctx.session;

    const userSymbolPrices = userData[symbol] || [];

    watchList[ctx.from.id] = {
      ...userData,
      [symbol]: [...userSymbolPrices, price],
    };

    watchSymbols[symbol] = {
      lastPrice,
      currencySymbol,
    };

    delete ctx.session.isSelect;
    delete ctx.session.symbol;
    delete ctx.session.price;
    delete ctx.session.currencySymbol;
    delete ctx.session.lastPrice;

    ctx.reply("Done, typewrite 'list' for get all watchers");
  } else {
    ctx.reply('Cancel');
  }
});

bot.hears(/list/i, (ctx) => {
  const { id } = ctx.from;

  const list = watchList[id];
  if (!list) {
    ctx.reply('List is empty');
    return;
  }

  const keys = Object.keys(list);
  const message = keys.reduce((prev, symbol) => {
    const { currencySymbol, lastPrice } = watchSymbols[symbol];
    return prev + list[symbol].reduce((summ, price) => `${summ}\r\n${symbol} = ${price} ${currencySymbol} (now ${lastPrice} ${currencySymbol})`, '');
  }, '');

  ctx.reply(message);
});

setInterval(() => {
  const users = Object.values(watchList);
  const symbols = Object.keys(watchSymbols);

  if (users.length === 0 || symbols.length === 0) return;
  log('Update watch list');

  Finance.quote({
    symbols,
    modules: ['price'],
  }, (err, quotes) => {
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
  });
}, 6e4);

bot.hears(/get ([\w|.|-]*)/i, (ctx) => {
  const symbol = ctx.match[1];

  Finance.quote({
    symbol,
    modules: ['price', 'summaryDetail'],
  }, (err, quote) => {
    if (err) {
      log(err);
      return;
    }

    ctx.reply(JSON.stringify(quote.price, null, 2));
    ctx.reply(JSON.stringify(quote.summaryDetail, null, 2));
  });
});

bot.startPolling();
