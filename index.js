
const cors = require('cors')
const fs = require('fs');
const express = require('express')
const multer = require('multer')
const path = require('path');
const e = require('cors');
const prompt = require('prompt')

const savePath = "save.json"
const app = express()
const port = (process.env.PORT || 8080)

const users = "users"

const error = "error"
const username = "username"
const name = "name"
const email = "email"
const password = "password"
const phoneno = "phoneno"
const gender = "gender"    //Char?
const dob = "dob"  //Date
const admin = "admin"   //True/False
const psychiatrist = "psychiatrist"    //True/False
const psychiatristVerified = "psychiatristVerified" //True/False
const registrationDateTime = "registrationDateTime" //DateTime
const iamfine = "iamfine"   //True/False
const date = "date"
const datetime = "datetime"
const accounts = "accounts"
const google = "Google"
const twitter = "Twitter"
const facebook = "Facebook"
const id = "id"
const accEmail = "accEmail"

const command = "command"
const packet = "packet"
const command_login = "login"
const command_register = "register"
const command_loginRegisterGoogle = "loginRegisterGoogle"
const command_connectGoogle = "connectGoogle"
const command_iamfine = "iamfine"
const command_requestPsychiatrist = "requestPsychiatrist"

let saveData

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({storage: storage})

function save(){ fs.writeFileSync(savePath, JSON.stringify(saveData, null, 4)) }
function readCommandPacket(commandJson){
    switch (commandJson[command]){
        case command_login:
            return login(commandJson)
        case command_register:
            return register(commandJson)
        case command_loginRegisterGoogle:
            return loginRegisterGoogle(commandJson)
        case command_connectGoogle:
            return connectGoogle(commandJson)
        case command_iamfine:
            return recordIAmFine(commandJson)
    }
    return [false, `INTERNAL: UNKOWN COMMAND: ${commandJson[command]}`]
}
function login(commandJson){
    if (commandJson[command] != command_login) return [false, `SERVER INTERNAL: LOGIN: Expecting ${command_login} but got ${commandJson[command]} instead`]
    let lpacket = commandJson[packet]
    let lemail = lpacket[email]
    let lpassword = lpacket[password]

    if (lemail == "" || lpassword == ""){
        return [false, "Invalid Email or Password"]
    }
    console.log(`Attempting to log in with: ${lemail}, ${lpassword}`)

    for (let user in saveData[users]){
        user = saveData[users][user]
        if (user[email] == lemail || user[username] == lemail){
            if (user[password] == lpassword){
                return [true, user]
            }
            else{
                return [false, "Invalid Password"]
            }
        }
    }
    return [false, "Invalid Email or Username"]

}
function register(commandJson){
    if (commandJson[command] != command_register) return [false, `SERVER INTERNAL: REGISTER: Expecting ${command_register} but got ${commandJson[command]} instead`]
    let rpacket = commandJson[packet]
    let rusername = rpacket[username]
    let rname = rpacket[name]
    let remail = rpacket[email]
    let rpassword = rpacket[password]
    let rphoneno = rpacket[phoneno]
    let rgender = rpacket[gender]
    let rdob = rpacket[dob]
    let rpsychiatrist = rpacket[psychiatrist]

    //Check username & email
    for (let user in saveData[users]){
        user = saveData[users][user]
        if (user[username] == rusername){
            return [false, "Username already exist"]
        }
        else if (user[email] == remail){
            return [false, "Email already exist"]
        }
    }

    let newUser = JSON.parse("{}")
    newUser[username] = rusername
    newUser[name] = rname
    newUser[email] = remail
    newUser[password] = rpassword
    newUser[phoneno] = rphoneno
    newUser[gender] = rgender
    newUser[dob] = rdob
    newUser[psychiatrist] = rpsychiatrist
    if (rpsychiatrist == "true"){
        newUser[psychiatristVerified] = false
    }
    newUser[registrationDateTime] = new Date()

    saveData[users].push(newUser)
    save();
    return [true, newUser]
}
function loginRegisterGoogle(commandJson){
    if (commandJson[command] != command_loginRegisterGoogle) return [false, `SERVER INTERNAL: LOGIN GOOGLE: Expecting ${command_loginRegisterGoogle} but got ${commandJson[command]} instead`]
    let lpacket = commandJson[packet]
    let lid = lpacket[id]
    let lemail = lpacket[email]
    let laccEmail = lpacket[accEmail]

    console.log(`Attempting to log in via Google with id: ${lid}, ${lemail}`)

    for (let user in saveData[users]){
        user = saveData[users][user]
        let userAccounts = user[accounts]
        for (let acc in userAccounts){
            acc = userAccounts[acc]
            if (acc[name] == google){
                if (acc[id] == lid){
                    foundAcc = true
                    return [true, user]
                }
            }
        }
    }
    //Brand new account
    let newUser = JSON.parse("{}")
    newUser[username] = ""
    newUser[name] = lpacket[name]
    newUser[email] = laccEmail
    newUser[password] = ""
    newUser[phoneno] = ""
    newUser[gender] = "o"
    newUser[dob] = (new Date()).toString().substring(0, 10)
    newUser[psychiatrist] = "false"
    newUser[registrationDateTime] = new Date()
    
    let newGoogleAcc = JSON.parse("{}")
    newGoogleAcc[name] = google
    newGoogleAcc[id] = lid
    newGoogleAcc[email] = laccEmail
    newUser[accounts] = []
    newUser[accounts].push(newGoogleAcc)

    saveData[users].push(newUser)
    save();

    return [true, newUser]
}
function connectGoogle(commandJson){
    if (commandJson[command] != command_connectGoogle) return [false, `SERVER INTERNAL: CONNECT GOOGLE: Expecting ${command_connectGoogle} but got ${commandJson[command]} instead`]
    let cpacket = commandJson[packet]
    let cid = cpacket[id]
    let cemail = cpacket[email]
    let caccEmail = cpacket[accEmail]

    console.log(`Attempting to connect Google with id: ${cid}, ${cemail}`)
    
    for (let user in saveData[users]){
        if (user[email] == cemail){
            let userAccounts = user[accounts]
            for (let i in userAccounts){
                let acc = userAccounts[i]
                if (acc[name] == google){
                    delete userAccounts[i]
                    break
                }
            }
            //Add Account
            let newGoogleAcc = JSON.parse("{}")
            newGoogleAcc[name] = google
            newGoogleAcc[id] = cid
            newGoogleAcc[email] = caccEmail

            userAccounts.push(newGoogleAcc)
            save()
            return [true, user]
        }
    }
    return [false, "Email not found"]
}
function getUserFromUsername(uname){
    for (let user in saveData[users]){
        user = saveData[users][user]
        if (user[username] == uname){
            return user
        }
    }
    return null
}
function recordIAmFine(commandJson){
    if (commandJson[command] != command_iamfine) return [false, `SERVER INTERNAL: LOGIN: Expecting ${command_iamfine} but got ${commandJson[command]} instead`]
    let ipacket = commandJson[packet]
    let iiamfine = ipacket[iamfine]
    let date = new Date()
    
}

console.log("Initializing...")

//Save File
console.log("Reading save file")
try {
    let rawReadData = fs.readFileSync(savePath)
    console.log("Parsing save file")
    saveData = JSON.parse(rawReadData)
} catch (error) {
    //fs.writeFileSync(savePath, "{}");  //Suppress rewriting in case of simple error
    console.log(error);
}

//Server
console.log("Starting Server...")
app.use(cors())

app.use(express.static(__dirname))

app.listen(port, () => {
    console.log(`Raven's lame server running at http://localhost:${port}`)
})


app.post('/', function (request, response) {

    console.log("Request => " + request.socket.remoteAddress + " OR/AND " + request.headers['x-forwarded-for'])

    request.on('data', function (data) {

        let jsonPacket = JSON.parse(data)
        console.log(jsonPacket)

        let result  = readCommandPacket(jsonPacket)
        let reply
        if (result[0]){
            console.log("Success Result Generation - %s command", jsonPacket[command])
            reply = result[1]
        }
        else{
            console.error("Failure: %s command", jsonPacket[command])
            reply = JSON.parse("{\"error\": \"" + result[1] + "\"}")
        }
        response.send(reply)

        response.end()
    });


});

app.use("/uploads", express.static("uploads"))
app.post("/upload", upload.single("file" /* name attribute of <file> element in your form */), (request, response) => {

    console.log("File name = " + request.file.filename)
    filename = request.file.filename
    let user = getUserFromUsername(filename)
    if (user == null){
        console.log("User null")
        fs.unlinkSync(request.file.path)
        response.status(200).end("{\"message\": \"Failure - User not found\"}")
    }
    else{
        if (user.hasOwnProperty(psychiatrist) && user[psychiatrist] == "true"){
            response.status(200).end("{\"message\": \"Success\"}")
        }
        else{
            console.log("not psychiatrist")
            fs.unlinkSync(request.file.path)
            response.status(200).end("{\"message\": \"Failure - User not a psychiatrist\"}")
        }
    }
    
});
app.get("/", function(req, res){

    console.log("GET Call")
    console.log(req.headers)
    console.log(res.json)

})
app.use("/", function(req, res){
    console.log("USE")
})
app.emit("/", function(req, res){
    console.log("EMIT")
})


function check(){
    checkPsychiatristImages()
}
function checkPsychiatristImages(){
    let today = new Date()
    for (let user in saveData[users]){
        user = saveData[users][user]
        if (user.hasOwnProperty(psychiatrist) && user.hasOwnProperty(psychiatristVerified) && !user[psychiatristVerified]){
            if (user.hasOwnProperty(registrationDateTime)){
                let registeredAt = new Date(user[registrationDateTime])
                let difference = today.getTime() - registeredAt.getTime()
                let total_seconds = parseInt(Math.floor(difference / 1000));
                let total_minutes = parseInt(Math.floor(total_seconds / 60));
                let total_hours = parseInt(Math.floor(total_minutes / 60));
                console.log(total_hours)
                if (total_hours >= 24){
                    //TODO DELETE USER
                    console.log("Over a day!")
                }
            }
        }
    }
}
function update(){

}
function updateAddAccounts(){

}

prompt.start()

function getCommand(){
    prompt.get(["command"], function(err, result){
        let command = result.command
        switch(command){
            case "check":
                check()
                break;
        }
        getCommand()
    })
}
getCommand()

console.log("\n--END OF FILE--")
