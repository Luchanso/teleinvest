const { log } = console;

export const help = (ctx) => {
  return ctx.reply(`
/list
/get TWX
/watch BTC-USD 231.2
/remove ROSN.ME
`);
};

export default {
  help,
};
