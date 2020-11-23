

var getRequest = (uri) => {
    return new Promise((resolve, reject) => {
        console.log("GET ",uri)
        fetch(uri)
        .then(function(response) {
            return response.blob()
        })
        .then(function(response) {
            return response.text()
        })
        .then(data => {
            //console.log(data)
            resolve(data)
        })
        .catch(reject)

        setTimeout(() => resolve("{}"),1000)
    })
}

var testAndCreate = (cont,id,className,type,content) => {
    if(!type) type = "div"
    let elem = document.getElementById(id)
    if(!elem) {
        elem = document.createElement(type)
        elem.id = id
        cont.appendChild(elem)
    }
    if(className) elem.className = className
    if(content && content != elem.innerHTML) elem.innerHTML = content
    return elem
}

var bitToShort = (bit) => {
    if(bit > 10000)
        return parseInt(bit/1024 )+ "kb/s"
    if(bit > 10000000)
        return parseInt(bit/1024 )+ "Mb/s"
    return bit + "b/s"

}

setInterval(() => getRequest("backoffice").then((data) => {
    let jdata = JSON.parse(data)
    if(jdata.data.length) {
        let cont = document.getElementById("container")
        jdata.data.forEach((v) => {
            console.log(v.rates)
            let elem = testAndCreate(cont,"elem-" + v.ip,"element")
            if(jdata.sentTime-v.lastSeen > 10000) elem.classList.add("offline")
            console.log(jdata.sentTime,v.lastSeen,jdata.sentTime-v.lastSeen)
            testAndCreate(elem,"elem-ip-"+v.ip,"elem-ip",false,v.ip)
            testAndCreate(elem,"elem-name-"+v.ip,"elem-name",false,v.name)
            let traffic = testAndCreate(elem,"elem-traffic-"+v.ip,"elem-traffic","table")
            testAndCreate(elem,"elem-sent-"+v.ip,"elem-sent",false,"Sent: " + v.data.rates.sent)
            testAndCreate(elem,"elem-received-"+v.ip,"elem-received",false,"Received:" + v.data.rates.received)
            v.data.details.forEach(d => {
                let A = d.hostA
                let B = d.hostB
                if(d.lastSeen < v.lastSeen - 1000) {
                    let test = document.getElementById("elem-traffic-" + v.ip + "-" + A + B)
                    if(test) test.outerHTML = ""
                    test = document.getElementById("elem-traffic-" + v.ip + "-" + B + A)
                    if(test) test.outerHTML = ""
                    return
                }
                testAndCreate(traffic,"elem-traffic-" + v.ip + "-" + A + B,"elem-traffic-Node","tr",
                    "<td class=right>" + A + "</td><td>=></td><td> " + B +"</td><td class=right> " + bitToShort(d.AtoB) + "</td>")
                testAndCreate(traffic,"elem-traffic-" + v.ip + "-" + B + A,"elem-traffic-Node alternate","tr",
                    "<td></td><td><=</td><td></td><td class=right>  " + bitToShort(d.BtoA) + "</td>")
            })
        })
    }
}),3000)