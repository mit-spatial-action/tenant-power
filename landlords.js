const path = require('path')
const express = require('express')
const vue = require('vue')
const http = require('http')
const https = require('https')
const app = express()
const db = require('./queries')

app.set('port', (process.env.PORT || 3000));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', (req, res) => {
  res.sendFile(path.join(app.get('views') + '/index.html'));
})

app.get('/props/clst/:clst', db.getPropsByClst)
app.get('/props/xy/:lng/:lat/:cnt', db.getPropsByLoc)

app.listen(app.get('port'), () => {
  console.log(`App running on ${app.get('port')}.`)
})