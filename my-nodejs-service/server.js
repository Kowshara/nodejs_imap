const bodyParser = require('body-parser');
const path = require(`path`);
const express = require('express');
const app = express();
var Imap = require('imap'),
    inspect = require('util').inspect;

var imap = new Imap({
  user: 'exampleimap123@gmail.com',
  password: 'BnF28vvZQ93kZR3',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

imap.once('ready', function() {
  console.log('You did it!');
});

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/form.html'));
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
  console.log({
    name: req.body.name,
    message: req.body.message
  });
  res.send('Thanks for your message!');
});