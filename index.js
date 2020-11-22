const { spawn } = require('child_process');

const optionDefinitions = [
    { name: 'server', type: String, multiple: true, defaultOption: true }
  ]

const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)
console.log(options)

const https = require('https')




let data = {
    history: {
        rateSent: [],
        rateReceived: []
    },
    details : []
}

var addAndForget= (Mem, Value, Size) => {
    if(Mem.length > Size+1)
        Mem.splice(0,1)
    Mem.push(Value)
}

var toBit = (Val) => {
    if(Val.includes("Mb") || Val.includes('MB'))
        return parseInt(1000*1000*parseFloat(Val))
    if(Val.includes("Kb") || Val.includes('KB'))
        return parseInt(1000*parseFloat(Val))
    return parseInt(Val)
}

setInterval(() => {
    const iftop = spawn('iftop', ['-i', 'eno1','-t','-s','2']);

    iftop.stdout.on('data', (out) => {
    //console.log(`stdout: ${data}`);
    let Lines = out.toString().split('\n')
    Lines.forEach((L, Lid) => {
        let timeCapture = Date.now()
        if(L.startsWith('Peak rate')) {
            let CS = L.split(/\s+/)
            data.rates = {
                sent: CS[3],
                received: CS[4]
            }
            addAndForget(data.history.rateSent,toBit(CS[3]),100)
            addAndForget(data.history.rateReceived,toBit(CS[4]),100)
        }
        else if(L.startsWith('Cumulative ')) {
            let CS = L.split(/\s+/)
            if(!data.cumulative) data.cumulative = { sent: 0, received: 0}
            if(CS[2].includes('MB'))
                data.cumulative.sent += toBit(CS[2])
            if(CS[3].includes('MB'))
                data.cumulative.received += toBit(CS[3])
        }
        else if(L.match(/^\s+\d+\s+/)) {
            let CS = Lines[Lid].split(/\s+/)
            let HostA = CS[2]
            let AtoB = toBit(CS[4])
            if(Lines[Lid+1].includes("<=")) {
                let CS = Lines[Lid+1].split(/\s+/)
                let HostB = CS[1]
                let BtoA = toBit(CS[3])
                let i = data.details.findIndex((v) => v.hostA == HostA && v.hostB == HostB)
                let d = {
                    hostA: HostA,
                    hostB: HostB,
                    BtoA: BtoA,
                    AtoB: AtoB,
                    lastSeen: timeCapture
                }
                if(i >= 0)
                    data.details[i] = d
                else
                    data.details.push(d)
            }
        }
    })

    });

    iftop.stderr.on('data', (data) => {
    //console.error(`stderr: ${data}`);
    });

    iftop.on('close', (code) => {
    //console.log(`child process exited with code ${code}`);
      const postOptions = {
        hostname: options.server,
        port: 80,
        path: '/backoffice',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }
      
      const req = https.request(postOptions, res => {
        console.log(`statusCode: ${res.statusCode}`)
      
        res.on('data', d => {
          //process.stdout.write(d)
        })
      })
      
      req.on('error', error => {
        //console.error(error)
      })

    req.write(data)
    req.end()
    });
},2000)

setInterval(() => console.log(data),1000)
