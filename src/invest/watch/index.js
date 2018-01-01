import Finance from 'yahoo-finance';
import Markup from 'telegraf/markup';

const { log } = console;

export const triggers = /\/watch ([\w|.|-]*) ([\d|.]*)/i;

export const watch = (ctx) => {
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
}
