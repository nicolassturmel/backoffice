var express = require('express');
var app = express();
var bodyParser = require('body-parser')

let data = []
app.use(bodyParser.json())


app.post("/backoffice", (req,res) => {
    console.log(req.ip)
    let id = data.findIndex((e) => e.ip == req.ip)
    let obj = {
        lastSeen: Date.now(),
        data: req.body,
        ip: req.ip
    }
    if(id == -1) {
        data.push(obj)
    }
    else {
        data[id] = obj
    }
    res.send()
})

app.get("/backoffice", (req,res) => res.send(JSON.stringify(data)))

app.use('/', express.static(__dirname + '/html'));

app.listen(80, function() {
  console.log('Example app listening on port 80!');
});
