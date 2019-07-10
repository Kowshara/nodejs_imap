const path = require(`path`);
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new Router();

const Imap = require('imap'),
    inspect = require('util').inspect;
    
router.post('/api/check', async (ctx, next) => {
  // ctx.request.body.email
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
      openInbox(function(err, box) {
        if (err) {
          ctx.status=400;
          resolve(err)
        };
        var f = imap.seq.fetch(box.messages.total, { bodies: ['HEADER.FIELDS (FROM)','TEXT'] });
        f.on('message', function(msg, seqno) {
          console.log('Message #%d', seqno);
          var prefix = '(#' + seqno + ') ';
          msg.on('body', function(stream, info) {
            if (info.which === 'TEXT')
              console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
            var buffer = '', count = 0;
            stream.on('data', function(chunk) {
              count += chunk.length;
              buffer += chunk.toString('utf8');
              if (info.which === 'TEXT')
                console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);
            });
            stream.once('end', function() {
              if (info.which !== 'TEXT')
                console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
              else
                console.log(prefix + 'Body [%s] Finished', inspect(info.which));
            });
          });
          msg.once('attributes', function(attrs) {
            console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
          });
          msg.once('end', function() {
            console.log(prefix + 'Finished');
          });
        });
        f.once('error', function(err) {
          console.log('Fetch error: ' + err);
        });
        f.once('end', function() {
          console.log('Done fetching all messages!');
          imap.end();
        });
      });



      resolve("done");





    });

    imap.once('error', function(err) {
      ctx.status=400;
      resolve(err);
    });
    imap.once('end', function() {
      console.log('Connection ended');
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
