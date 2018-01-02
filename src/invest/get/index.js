import Finance from 'yahoo-finance';

const { log } = console;

export const getTriggers = /\/get ([\w|.|-]*)/i;

export const get = (ctx) => {
  const symbol = ctx.match[1];

  Finance.quote(
    {
      symbol,
      modules: ['price', 'summaryDetail'],
    },
    (err, quote) => {
      if (err) {
        log(err);
        return;
      }

      ctx.reply(JSON.stringify(quote.price, null, 2));
      ctx.reply(JSON.stringify(quote.summaryDetail, null, 2));
    },
  );
};
