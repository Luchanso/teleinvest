import Finance from 'yahoo-finance';
import { watchSymbols, watchList } from '../../db';

const { log } = console;

const updateWatchSymbols = (quotes) => {
  Object.keys(quotes).forEach((symbol) => {
    watchSymbols[symbol] = {
      ...watchSymbols[symbol],
      lastPrice: quotes[symbol].price.regularMarketPrice,
    };
  });
}

export const check = (bot) => {
  const users = Object.keys(watchList);
  const symbols = Object.keys(watchSymbols);

  if (users.length === 0 || symbols.length === 0) return;
  log('Update watch list');

  // TODO: Refactoring
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

      updateWatchSymbols(quotes);

      users.forEach((user) => {
        Object.keys(watchList[user]).forEach((symbol) => {
          const prices = watchList[user][symbol];

          prices.forEach((price) => {
            if (watchSymbols[symbol].lastPrice > price) {
              bot.telegram.sendMessage(user, `--- ALERT --- \n ${symbol} get price ${price} ${watchSymbols[symbol].currencySymbol}`);

              const deleteIndex = watchList[user][symbol].indexOf(price);
              watchList[user][symbol].splice(deleteIndex, 1);
            }
          });
        });
      });
    },
  );
};

export default {
  check,
};
