const { log } = console;

export const middleware = (ctx, next) => {
  log('Request', ctx.message);

  return next(ctx);
};

export default {
  middleware,
};
