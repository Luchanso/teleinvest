import { watchList, watchSymbols } from '../../db';

export const confirmationTriggers = /^(yes|no)$/;

export const confirmationWatch = (ctx) => {
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

    ctx.reply('Done, typewrite /list for get all watchers');
  } else {
    ctx.reply('Cancel');
  }
};
