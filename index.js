const Koa = require('koa');
const app = new Koa();

const responseTime = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
};

const logger = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
};

const response = (ctx) => { ctx.body = 'Hello World'; }

app.use(responseTime);
app.use(logger);
app.use(response);

app.listen(3000);
