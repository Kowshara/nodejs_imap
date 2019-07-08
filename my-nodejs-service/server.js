const path = require(`path`);
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new Router();

const Imap = require('imap'),
    inspect = require('util').inspect;
    
/*
var imap = new Imap({
  user: ' ',
  password: ' ',
  host: ' ',
  port: 993,
  tls: true
});


imap.once('end', function() {
  console.log('Connection ended');
});
*/



router.post('/api/check', async (ctx, next) => {
  // ctx.request.body.email
  /*
  imap.user=ctx.request.header.login;
  imap.password=ctx.request.header.password;
  imap.host=ctx.request.header.host;*/
  var imap = new Imap({
    user: ctx.request.header.login,
    password: ctx.request.header.password,
    host: ctx.request.header.host,
    port: 993,
    tls: true
  });
  const promise = new Promise((resolve, reject) => {
    
    function openInbox(cb) {
      imap.openBox('INBOX', true, cb);
    };

    imap.once('ready', function() {
      resolve("You connecte to mail");
    });

    imap.once('error', function(err) {
      ctx.status=400;
      resolve(err);
    });

    imap.connect();
  
  });

  ctx.body = await promise;
  await next();
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8080);
