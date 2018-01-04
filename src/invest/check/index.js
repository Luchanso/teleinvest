import Finance from 'yahoo-finance';
import { watchSymbols, watchList } from '../../db';

const { log } = console;

export const check = (bot) => {
  const users = Object.keys(watchList);
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
};

export default {
  check,
};
