import { watchSymbols, watchList } from '../../db';

export const listTriggers = /\/list/i;

export const listFunc = (ctx) => {
  const { id } = ctx.from;

  const list = watchList[id];
  if (!list) {
    ctx.reply('List is empty');
    return;
  }

  const keys = Object.keys(list);

  if (keys.length === 0) {
    ctx.reply('List is empty');
    return;
  }

  const message = keys.reduce((prev, symbol) => {
    const { currencySymbol, lastPrice } = watchSymbols[symbol];
    return (
      prev +
      list[symbol].reduce(
        (summ, price) =>
          `${summ}\r\n${symbol} = ${price} ${currencySymbol} (now ${lastPrice} ${currencySymbol})`,
        '',
      )
    );
  }, '');

  ctx.reply(message);
};
