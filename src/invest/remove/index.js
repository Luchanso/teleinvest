import { watchList } from '../../db';

export const removeTriggers = /\/remove ([\w|.|-]*)/i;

export const remove = (ctx) => {
  const symbol = ctx.match[1];
  const { id } = ctx.from;
  const list = watchList[id];

  if (!list) return ctx.reply("You don't have watchers");

  delete watchList[id][symbol];

  return ctx.reply('Done, typewrite /list for info');
};
