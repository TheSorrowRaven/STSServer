
const googleClientId = "90822878962-i00qcr18beaclqe22i2gttf4dmslcob5.apps.googleusercontent.com"
const googleClientSecret = "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"

const cors = require('cors')
const fs = require('fs');
const express = require('express')
const multer = require('multer')
const prompt = require('prompt')
const telegram_bot = require('node-telegram-bot-api')
const mailer = require('@sendgrid/mail');
mailer.setApiKey(process.env.SENDGRID_API_KEY || "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")
const {google} = require('googleapis');

const refreshToken = "refreshToken"
const accessToken = "accessToken"


const bot = new telegram_bot("2107642044:AAGpJMpEZEJriMyWZD61wWrt72MXFpquNUs", {polling: true})
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
const diary = "diary"
const date = "date"
const datetime = "datetime"
const accounts = "accounts"
const accType = "accType"
const googleAcc = "Google"
const twitter = "Twitter"
const telegram = "Telegram"
const id = "id"
const accEmail = "accEmail"
const prepared = "prepared"
const chatId = "chatId"
const address = "address"
const googleEmail = "googleEmail"
const patientEmail = "patientEmail"
const startDateTime = "startDateTime"
const endDateTime = "endDateTime"
const otherEmail = "otherEmail"
const friends = "friends"
const pings = "pings"
const pendingPings = "pendingPings"
const pastPings = "pastPings"
const helpPsychiatrist = "helpPsychiatrist"
const patients = "patients"
const questionnaires = "questionnaires"
const answer = "answer"
const appointments = "appointments"
const meetLink = "meetLink"

const command = "command"
const packet = "packet"
const command_login = "login"
const command_register = "register"
const command_loginRegisterGoogle = "loginRegisterGoogle"
const command_loginRegisterTwitter = "loginRegisterTwitter"
const command_connectGoogle = "connectGoogle"
const command_connectTwitter = "connectTwitter"
const command_prepareTelegramID = "prepareTelegramID"
const command_iamfine = "iamfine"
const command_diary = "diary"
const command_joinGetTC = "joinGetTC"
const command_makeAppointmentWith = "makeAppointmentWith"
const command_addFriend=  "addFriend"
const command_deleteFriend = "deleteFriend"
const command_pingFriend = "pingFriend"
const command_replyPing = "replyPing"
const command_fetchUnverifiedPsychiatrists = "fetchUnverifiedPsychiatrists"
const command_verifyUser = "verifyUser"
const command_denyUser = "denyUser"
const command_deleteUser = "deleteUser"
const command_fetchAllUsers = "fetchAllUsers"
const command_fetchAllPsychiatrists = "fetchAllPsychiatrists"
const command_requestPsychiatrist = "requestPsychiatrist"
const command_viewQuestionnaire = "viewQuestionnaire"
const command_answerQuestionnaire = "answerQuestionnaire"
const command_refresh = "refresh"

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
let saveData

/**
 * A Multer Disk Storage for storing image uploads
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const oauth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    "https://sorrow-to-smiles.glitch.me"
);

const scopes = [
    'https://www.googleapis.com/auth/calendar'
];

/**
 * Creates an Auth URL for authorizing Google Calendar
 */
const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});
console.log(url)
/**
 * On Auth2Client token change, save tokens and fetch Calendar
 */
oauth2Client.on('tokens', (tokens) => {
    let adminStorage = saveData[users][0][accounts][0]
    let rToken = tokens.refresh_token
    let aToken = tokens.access_token
    if (rToken) {
        console.log("Below is refresh token")
        console.log(rToken)
        if (!(rToken == undefined || rToken == null || rToken == "")){
            adminStorage[refreshToken] = rToken
        }
    }
    console.log("Below is access token")
    console.log(aToken)
    if (!(aToken == undefined || aToken == null || aToken == "")){
        adminStorage[accessToken] = aToken
    }
    save()
    fetchTCCalendar()
})
function loadTokens(){
    let adminStorage = saveData[users][0][accounts][0]
    if (adminStorage.refreshToken){
        oauth2Client.setCredentials({
            refresh_token: adminStorage.refreshToken
        })
    }
    if (adminStorage.accessToken){
        oauth2Client.setCredentials({
            access_token: adminStorage.accessToken
        })
    }
}




const upload = multer({storage: storage})

const telegramPreparedIDs = { IDs: [] }

/**
 * Saves the JSON
 */
function save(){ fs.writeFileSync(savePath, JSON.stringify(saveData, null, 4)) }
/**
 * Validates an Email with REGEX
 */
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
/**
 * Reads the sent command from client
 */
function readCommandPacket(commandJson){
    switch (commandJson[command]){
        case command_login:
            return login(commandJson)
        case command_register:
            return register(commandJson)
        case command_loginRegisterGoogle:
            return loginRegisterGoogle(commandJson)
        case command_loginRegisterTwitter:
            return loginRegisterTwitter(commandJson)
        case command_connectGoogle:
            return connectGoogle(commandJson)
        case command_connectTwitter:
            return connectTwitter(commandJson)
        case command_iamfine:
            return recordIAmFine(commandJson)
        case command_diary:
            return recordDiary(commandJson)
        case command_joinGetTC:
            return joinGetTC(commandJson)
        case command_makeAppointmentWith:
            return makeAppointment(commandJson)
        case command_addFriend:
            return friendAdd(commandJson)
        case command_deleteFriend:
            return friendDelete(commandJson)
        case command_pingFriend:
            return pingEmail(commandJson)
        case command_replyPing:
            return answerPing(commandJson)
        case command_fetchUnverifiedPsychiatrists:
            return getUnverifieds(commandJson)
        case command_verifyUser:
            return verifyUser(commandJson)
        case command_denyUser:
            return denyUser(commandJson)
        case command_deleteUser:
            return deleteUser(commandJson)
        case command_fetchAllUsers:
            return getAllUsers(commandJson)
        case command_fetchAllPsychiatrists:
            return getPsychiatrists(commandJson)
        case command_requestPsychiatrist:
            return addPsychiatrist(commandJson)
        case command_viewQuestionnaire:
            return seeQuestionnaire(commandJson)
        case command_answerQuestionnaire:
            return addQuestionnaire(commandJson)
        case command_refresh:
            return refreshRequest(commandJson)
    }
    return [false, `INTERNAL: UNKOWN COMMAND: ${commandJson[command]}`]
}
/**
 * Send an email to an address via SendGrid
 */
function sendEmail(emailAdress, title, content){
    if (!validateEmail(emailAdress)){
        return
    }
    const message = {
        to: emailAdress,
        from: "sorrowtosmiles.mmu.sef.iamfine@gmail.com",
        subject: title,
        text: content
    }
    mailer.send(message).then(() => {
        console.log("Email sent to: " + emailAdress)
    }).catch((error) => {
        console.error(error)
    })
}
/**
 * Send a successfully registered email to an address
 */
function registeredSendEmail(email, content){
    sendEmail(email, "WELCOME to: Sorrow To Smiles", content)
}
/**
 * Login a user from credentials
 */
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
        if (user[email] == "" || user[username] == "" || user[password] == ""){
            //Don't allow manual sign in (Only allow sign in via connected accounts)
            continue;
        }
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
/**
 * Register a user from json data
 */
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
    registeredSendEmail(remail, "Welcome :).\nAccount was created!\n\nName: " + rname)
    save();
    return [true, newUser]
}
/**
 * Login or Register an account via Google
 */
function loginRegisterGoogle(commandJson){
    if (commandJson[command] != command_loginRegisterGoogle) return [false, `SERVER INTERNAL: LOGIN GOOGLE: Expecting ${command_loginRegisterGoogle} but got ${commandJson[command]} instead`]
    let lpacket = commandJson[packet]
    let lid = lpacket[id]
    let lemail = lpacket[email]
    let laccEmail = lpacket[accEmail]
    let lname = lpacket[name]
    //let ltokens = lpacket[tokens]

    console.log(`Attempting to log in via Google with id: ${lid}, ${lemail}`)

    for (let user in saveData[users]){
        user = saveData[users][user]
        let userAccounts = user[accounts]
        for (let acc in userAccounts){
            acc = userAccounts[acc]
            if (acc[accType] == googleAcc){
                if (acc[id] == lid){
                    // if (ltokens){
                    //     acc[tokens] = ltokens   //Set to newest tokens
                    //     save()
                    // }
                    return [true, user]
                }
            }
        }
    }
    //Brand new account
    let newUser = JSON.parse("{}")
    newUser[username] = ""
    newUser[name] = lname
    newUser[email] = laccEmail
    newUser[password] = ""
    newUser[phoneno] = ""
    newUser[gender] = "u"
    newUser[dob] = (new Date()).toString().substring(0, 10)
    newUser[psychiatrist] = "false"
    newUser[registrationDateTime] = new Date()
    
    let newGoogleAcc = JSON.parse("{}")
    newGoogleAcc[accType] = googleAcc
    newGoogleAcc[id] = lid
    newGoogleAcc[email] = laccEmail
    newGoogleAcc[name] = lname
    //newGoogleAcc[tokens] = ltokens
    newUser[accounts] = []
    newUser[accounts].push(newGoogleAcc)

    saveData[users].push(newUser)
    save();

    registeredSendEmail(lemail, "Welcome :).\nAccount was created via Google login")
    return [true, newUser]
}
/**
 * Login or Register an account via Twitter
 */
function loginRegisterTwitter(commandJson){
    if (commandJson[command] != command_loginRegisterTwitter) return [false, `SERVER INTERNAL: LOGIN TWITTER: Expecting ${command_loginRegisterTwitter} but got ${commandJson[command]} instead`]
    let lpacket = commandJson[packet]
    let lid = lpacket[id]
    let lemail = lpacket[email]
    let lname = lpacket[name]

    console.log(`Attempting to log in via Twitter with id: ${lid}, ${lemail}`)

    for (let user in saveData[users]){
        user = saveData[users][user]
        let userAccounts = user[accounts]
        for (let acc in userAccounts){
            acc = userAccounts[acc]
            if (acc[accType] == twitter){
                if (acc[id] == lid){
                    return [true, user]
                }
            }
        }
    }
    //Brand new account
    let newUser = JSON.parse("{}")
    newUser[username] = ""
    newUser[name] = lpacket[name]
    newUser[email] = lemail
    newUser[password] = ""
    newUser[phoneno] = ""
    newUser[gender] = "u"
    newUser[dob] = (new Date()).toString().substring(0, 10)
    newUser[psychiatrist] = "false"
    newUser[registrationDateTime] = new Date()
    
    let newTwitterAcc = JSON.parse("{}")
    newTwitterAcc[accType] = twitter
    newTwitterAcc[id] = lid
    newTwitterAcc[name] = lname
    newUser[accounts] = []
    newUser[accounts].push(newTwitterAcc)

    saveData[users].push(newUser)
    save();

    return [true, newUser]
}
/**
 * Connects an account to a Google account
 */
function connectGoogle(commandJson){
    if (commandJson[command] != command_connectGoogle) return [false, `SERVER INTERNAL: CONNECT GOOGLE: Expecting ${command_connectGoogle} but got ${commandJson[command]} instead`]
    let cpacket = commandJson[packet]
    let cid = cpacket[id]
    let cemail = cpacket[email]
    let caccEmail = cpacket[accEmail]
    let cname = cpacket[name]
    //let ctokens = cpacket[tokens]

    console.log(`Attempting to connect Google with id: ${cid}, ${cemail}`)
    
    for (let a in saveData[users]){
        let user = saveData[users][a]
        if (user[email] == cemail){
            ensure(user, accounts, [])
            let userAccounts = user[accounts]
            for (let i in userAccounts){
                let acc = userAccounts[i]
                if (acc[accType] == googleAcc){
                    delete userAccounts[i]
                    break
                }
            }
            //Add Account
            let newGoogleAcc = JSON.parse("{}")
            newGoogleAcc[accType] = googleAcc
            newGoogleAcc[id] = cid
            newGoogleAcc[name] = cname
            newGoogleAcc[email] = caccEmail
            //newGoogleAcc[tokens] = ctokens

            userAccounts.push(newGoogleAcc)
            save()
            sendEmail(cemail, "Connection To Google", "Google of the email: " + cemail + " has been added")
            return [true, user]
        }
    }
    return [false, "Email not found"]
}
/**
 * Connects an account to a Twitter account
 */
function connectTwitter(commandJson){
    if (commandJson[command] != command_connectTwitter) return [false, `SERVER INTERNAL: CONNECT TWITTER: Expecting ${command_connectTwitter} but got ${commandJson[command]} instead`]
    let cpacket = commandJson[packet]
    let cid = cpacket[id]
    let cemail = cpacket[email]
    let cname = cpacket[name]

    console.log(`Attempting to connect Twitter with id: ${cid}, ${cemail}`)
    
    for (let a in saveData[users]){
        let user = saveData[users][a]
        if (user[email] == cemail){
            ensure(user, accounts, [])
            let userAccounts = user[accounts]
            for (let i in userAccounts){
                let acc = userAccounts[i]
                if (acc[accType] == twitter){
                    delete userAccounts[i]
                    break
                }
            }
            //Add Account
            let newTwitterAcc = JSON.parse("{}")
            newTwitterAcc[accType] = twitter
            newTwitterAcc[id] = cid
            newTwitterAcc[name] = cname

            userAccounts.push(newTwitterAcc)
            save()
            sendEmail(cemail, "Connection To Twitter", "Twitter of a handle name: " + cname + " has been added")
            return [true, user]
        }
    }
    return [false, "Email not found"]
}
/**
 * Prepares to connect to a telegram account
 */
function prepareTelegramID(commandJson, quickLoginAddress){
    if (commandJson[command] != command_prepareTelegramID) return [false, `SERVER INTERNAL: PREPARE TELEGRAM: Expecting ${command_prepareTelegramID} but got ${commandJson[command]} instead`]
    let cpacket = commandJson[packet]
    let cid = cpacket[id]
    let json = JSON.parse("{}")
    json[id] = cid
    json[prepared] = false
    json[address] = quickLoginAddress
    if (cpacket[email]){
        json[email] = cpacket[email]
    }
    telegramPreparedIDs.IDs.push(json)
    return [true, json]
}
/**
 * Login or Register or connect an account to a Telegram account
 */
function loginRegisterTelegram(json){

    let isConnect = false
    let lemail = json[chatId].toString()
    if (json[email]){
        lemail = json[email]
        isConnect = true
    }
    let lchatId = json[chatId]
    let lname = json[name]
    let lusername = json[username]

    if (lname.trim() == ""){
        lname = lusername
    }

    if (isConnect){
        console.log(`Attempting to connect via Telegram with id: ${lchatId}, ${lusername}`)
        for (let a in saveData[users]){
            let user = saveData[users][a]
            if (user[email] == lemail){
                ensure(user, accounts, [])
                let userAccounts = user[accounts]
                for (let i in userAccounts){
                    let acc = userAccounts[i]
                    if (acc[accType] == telegram){
                        delete userAccounts[i]
                        break
                    }
                }
                //Add Account
                let newTelegramAcc = JSON.parse("{}")
                newTelegramAcc[accType] = telegram
                newTelegramAcc[chatId] = lchatId
                newTelegramAcc[name] = lname
                newTelegramAcc[username] = lusername

                userAccounts.push(newTelegramAcc)

                sendEmail(lemail, "Connection To Telegram", "Telegram of a username: " + lusername + " has been added")
                save()
                return user
            }
        }
        reply = JSON.parse("{}")
        reply[error] = "Email not found"
        return reply
    }
    else{
        console.log(`Attempting to log in via Telegram with id: ${lchatId}, ${lusername}`)
        for (let user in saveData[users]){
            user = saveData[users][user]
            let userAccounts = user[accounts]
            for (let acc in userAccounts){
                acc = userAccounts[acc]
                if (acc[accType] == telegram){
                    if (acc[chatId] == lchatId){
                        return user
                    }
                }
            }
        }
        //Brand new account
        let newUser = JSON.parse("{}")
        newUser[username] = lusername
        newUser[name] = lname
        newUser[email] = lemail
        newUser[password] = ""
        newUser[phoneno] = ""
        newUser[gender] = "u"
        newUser[dob] = (new Date()).toString().substring(0, 10)
        newUser[psychiatrist] = "false"
        newUser[registrationDateTime] = new Date()
        
        let newTelegramAcc = JSON.parse("{}")
        newTelegramAcc[accType] = telegram
        newTelegramAcc[chatId] = lchatId
        newTelegramAcc[name] = lname
        newTelegramAcc[username] = lusername
        newUser[accounts] = []
        newUser[accounts].push(newTelegramAcc)
    
        saveData[users].push(newUser)
        save();

        registeredSendEmail(lemail, "Welcome :)\nAccount was created via Telegram")

        return newUser
    }

}
/**
 * Gets a user by its username
 */
function getUserFromUsername(uname){
    for (let user in saveData[users]){
        user = saveData[users][user]
        if (user[username] == uname){
            return user
        }
    }
    return null
}
/**
 * Gets a user by its email
 */
function getUserFromEmail(e){
    for (let user in saveData[users]){
        user = saveData[users][user]
        if (user[email] == e){
            return user
        }
    }
    return null
}
/**
 * Records I Am Fine for a user
 */
function recordIAmFine(commandJson){
    if (commandJson[command] != command_iamfine) return [false, `SERVER INTERNAL: LOGIN: Expecting ${command_iamfine} but got ${commandJson[command]} instead`]
    let ipacket = commandJson[packet]
    let iemail = ipacket[email]
    let iiamfine = ipacket[iamfine]
    let idate = ipacket[date]

    let user = getUserFromEmail(iemail)
    if (user == null){
        return [false, "Email not found"]
    }
    if (!user[iamfine]){
        user[iamfine] = []
    }
    let newFine = {}
    newFine[date] = idate
    newFine[iamfine] = iiamfine
    user[iamfine].push(newFine)
    save()
    return [true, user]
}
/**
 * Records a diary entry for a user
 */
function recordDiary(commandJson){
    let dpacket = commandJson[packet]
    let demail = dpacket[email]
    let ddiary = dpacket[diary]
    let ddatetime = dpacket[datetime]

    let user = getUserFromEmail(demail)
    if (user == null){
        return [false, "Email not found"]
    }
    if (!user[diary]){
        user[diary] = []
    }
    let newDiary = {}
    newDiary[datetime] = ddatetime
    newDiary[diary] = ddiary
    user[diary].push(newDiary)
    save()
    return [true, user]
}
/**
 * Join and fetch the talking circle meet link by inviting via Calendar API
 */
function joinGetTC(commandJson){
    let jpacket = commandJson[packet]
    let jemail = jpacket[email]
    let jgoogleEmail = jpacket[googleEmail]

    inviteEmailToTC(jemail)
    if (jgoogleEmail){
        if (jgoogleEmail != jemail){
            inviteEmailToTC(jgoogleEmail)
        }
    }
    return [true, { link: "https://meet.google.com/ezr-gitp-yce"}]
}
/**
 * Adds a friend to a user. The added user will also add this user as a friend
 */
function friendAdd(commandJson){
    let fpacket = commandJson[packet]
    let femail = fpacket[email]
    let faddEmail = fpacket[otherEmail]

    let user = getUserFromEmail(femail)
    if (user == null){
        return [false, "User is NULL from email: " + femail]
    }

    let aFriends = ensure(user, friends, [])
    
    let target = getUserFromEmail(faddEmail)
    if (target == null){
        return [false, target + " not found"]
    }
    let bFriends = ensure(target, friends, [])

    aFriends.push({ email: faddEmail, name: target[name] })
    bFriends.push({ email: femail, name: user[name] })
    
    save()
    return [true, user]

}
/**
 * Deletes a friend of a user. The deleted user will also delete its user to a friend too
 */
function friendDelete(commandJson){
    let fpacket = commandJson[packet]
    let femail = fpacket[email]
    let faddEmail = fpacket[otherEmail]

    let user = getUserFromEmail(femail)
    if (user == null){
        return [false, "User is NULL from email: " + femail]
    }

    let aFriends = ensure(user, friends, [])
    
    let target = getUserFromEmail(faddEmail)
    if (target == null){
        return [false, target + " not found"]
    }
    let bFriends = ensure(target, friends, [])

    for (let i in aFriends){
        let f = aFriends[i]
        if (f[email] == faddEmail){
            aFriends.splice(i, 1)
            break
        }
    }
    for (let i in bFriends){
        let f = bFriends[i]
        if (f[email] == femail){
            bFriends.splice(i, 1)
            break
        }
    }
    
    save()
    return [true, user]
}
/**
 * Pings a user by their email
 */
function pingEmail(commandJson){
    let ppacket = commandJson[packet]
    let pemail = ppacket[email]
    let potherEmail = ppacket[otherEmail]

    let user = getUserFromEmail(pemail)
    if (user == null){
        return [false, "User is null for: " + pemail]
    }
    ensure(user, pings, {})

    let target = getUserFromEmail(potherEmail)
    if (target == null){
        return [false, "User not found for target: " + potherEmail]
    }
    let targetAllPings = ensure(target, pings, {})

    let pending = ensure(targetAllPings, pendingPings, [])

    pending.push({
        email: pemail,  //FROM
        name: user[name]
    })

    save()
    return [true, {
        message: "Successfully pinged - " + target[name]
    }]
    
}
/**
 * Answers a ping with I Am Fine or not by their email
 */
function answerPing(commandJson){
    let apacket = commandJson[packet]
    let aemail = apacket[email]
    let aotherEmail = apacket[otherEmail]
    let aIamFine = apacket[iamfine]
    let aDateTime = apacket[datetime]

    let user = getUserFromEmail(aemail)
    if (user == null){
        return [false, "User is null for: " + aemail]
    }
    let target = getUserFromEmail(aotherEmail)
    if (target == null){
        return [false, "User not found for target: " + aotherEmail]
    }

    let myPings = ensure(user, pings, {})
    let pPings = ensure(myPings, pendingPings, [])
    //Remove ping from pending
    for (let i in pPings){
        let p = pPings[i]
        if (p[email] == aotherEmail){
            pPings.splice(i, 1)
            break
        }
    }

    let targetAllPings = ensure(target, pings, {})

    let past = ensure(targetAllPings, pastPings, [])

    past.push({
        email: aemail,
        name: user[name],
        iamfine: aIamFine,
        datetime: aDateTime
    })

    save()
    return [true, user]
}
/**
 * Fetches unverified psychiatrists for verification and approval
 */
function getUnverifieds(commandJson){
    let reply = { users: [] }
    let u = reply.users
    for (let i in saveData[users]){
        let user = saveData[users][i]
        if (user[psychiatrist] == "true" && !user[psychiatristVerified]){
            u.push({
                email: user[email],
                username: user[username],
                name: user[name]
            })
        }
    }
    return [true, reply]
}
/**
 * Fetches all users, excep the admin itself
 */
function getAllUsers(commandJson){
    let reply = { users: [] }
    let u = reply.users
    let skipAdmin = true
    for (let i in saveData[users]){
        if (skipAdmin){
            skipAdmin = false
            continue
        }
        let user = saveData[users][i]
        u.push({
            email: user[email],
            name: user[name]
        })
    }
    return [true, reply]
}
/**
 * Verifies a psychiatrist (accept) and send the user an email
 */
function verifyUser(commandJson){
    let vpacket = commandJson[packet]
    let vemail = vpacket[email]

    let user = getUserFromEmail(vemail)
    if (user == null){
        return [false, "User is null - " + email]
    }
    
    user[psychiatristVerified] = true
    save()
    sendEmail(vemail, "Sorrow To Smiles Psychiatrist Registration Acceptance", "Your License Been Approved :)\nYou can now login to Sorrow To Smiles!")

    return [true, { message: "Successful" }]

}
/**
 * Denies a psychiatrist and send them an email
 */
function denyUser(commandJson){
    let dpacket = commandJson[packet]
    let demail = dpacket[email]

    let denied = false
    for (let i in saveData[users]){
        let user = saveData[users][i]
        if (user[email] == demail){
            saveData[users].splice(i)
            denied = true
            sendEmail(demail, "Sorrow To Smiles Psychiatrist Registration Denial", "Your License Have Been Denied")
            break
        }
    }
    if (denied){
        save()
        return [true, { message: "Successful" }]
    }
    else{
        return [false, "User not found: " + demail]
    }

}
/**
 * Deletes a user by their email
 */
function deleteUser(commandJson){
    let dpacket = commandJson[packet]
    let demail = dpacket[email]

    let denied = false
    for (let i in saveData[users]){
        let user = saveData[users][i]
        if (user[email] == demail){
            saveData[users].splice(i, 1)
            denied = true
            sendEmail(demail, "Sorrow To Smiles - Account Deletion", "Your account has been deleted.\nGoodbye!")
            break
        }
    }
    if (denied){
        save()
        return [true, { message: "Successful" }]
    }
    else{
        return [false, "User not found: " + demail]
    }
}
/**
 * Fetches all psychiatrists
 */
function getPsychiatrists(commandJson){
    let reply = { users: [] }
    let u = reply.users
    for (let i in saveData[users]){
        let user = saveData[users][i]
        if (user[psychiatrist] == "true"){
            u.push({
                email: user[email],
                name: user[name],
                phoneno: user[phoneno]
            })
        }
    }
    return [true, reply]
}
/**
 * Adds a psychiatrist to a user (patient). The psychiatrist will also add a patient
 */
function addPsychiatrist(commandJson){
    let apacket = commandJson[packet]
    let aemail = apacket[email]
    let aotherEmail = apacket[otherEmail]

    let pat = getUserFromEmail(aemail)
    if (pat == null){
        return [false, "User is null for: " + aemail]
    }

    let psy = getUserFromEmail(aotherEmail)
    if (psy == null){
        return [false, "User is null for: " + aotherEmail]
    }

    let targetPsy = ensure(pat, helpPsychiatrist, {})
    targetPsy[email] = psy[email]
    targetPsy[name] = psy[name]
    targetPsy[phoneno] = psy[phoneno]

    let targetPat = ensure(psy, patients, [])
    targetPat.push({
        email: pat[email],
        name: pat[name],
        phoneno: pat[phoneno]
    })

    save()
    return [true, pat]

}
/**
 * View a questionnaire of patient from psychiatrist
 */
function seeQuestionnaire(commandJson){
    let spacket = commandJson[packet]
    let semail = spacket[email]

    let user = getUserFromEmail(semail)
    if (user == null){
        return [false, "User is null for: " + semail]
    }

    let qs = ensure(user, questionnaires, [])
    if (qs.length > 0){
        let q = qs[qs.length - 1]
        return [true, q]
    }

    return [true, {
        message: "No Questionnaires Found For " + user[name]
    }]

}
/**
 * Submits a questionnaire by a user
 */
function addQuestionnaire(commandJson){
    let apacket = commandJson[packet]
    let aemail = apacket[email]
    let aanswer = apacket[answer]
    let adatetime = apacket[datetime]

    let user = getUserFromEmail(aemail)
    if (user == null){
        return [false, "User is null for: " + aemail]
    }

    let qs = (user, questionnaires, [])
    qs = user[questionnaires]
    qs.push({
        answer: aanswer,
        datetime: adatetime
    })
    save()
    return [true, user]


}
/**
 * Makes an appointment from a psychiatrist with a user by inviting them to a new google Calendar event
 */
function makeAppointment(commandJson){
    let mpacket = commandJson[packet]
    let memail = mpacket[email]
    let mpatientEmail = mpacket[patientEmail]
    let mstartDateTime = mpacket[startDateTime]
    let mendDateTime = mpacket[endDateTime]

    let psy = getUserFromEmail(memail)
    if (psy == null){
        return [false, "User is null for: " + memail]
    }

    let pat = getUserFromEmail(mpatientEmail)
    if (pat == null){
        return [false, "User is null for: " + mpatientEmail]
    }



    let psyGmail = tryGetGmailOf(psy)
    let emails = []
    emails.push(memail)
    if (psyGmail){
        if (memail != psyGmail){
            emails.push(psyGmail)
        }
    }

    let patGmail = tryGetGmailOf(pat)
    emails.push(mpatientEmail)
    if (patGmail){
        if (patGmail != mpatientEmail){
            emails.push(patGmail)
        }
    }

    let psyApp = ensure(psy, appointments, [])
    psyApp = psy[appointments]
    let psyInsert = {
        email: mpatientEmail,
        name: pat[name],
        datetime: mstartDateTime,
        meetLink: ""
    }
    psyApp.push(psyInsert)

    let patApp = ensure(pat, appointments, [])
    patApp = pat[appointments]
    let patInsert = {
        email: memail,
        name: psy[name],
        datetime: mstartDateTime,
        meetLink: ""
    }
    patApp.push(patInsert)

    createAppointmentAmong(emails, mstartDateTime, mendDateTime, function(link){
        psyInsert[meetLink] = link
        patInsert[meetLink] = link
        save()
    })

    save()
    return [true, psyInsert]
    
}
/**
 * Returns a request to refresh a user
 */
function refreshRequest(commandJson){
    let rpacket = commandJson[packet]
    let remail = rpacket[email]

    let user = getUserFromEmail(remail)
    if (user == null){
        return [false, "User is null for: " + remail]
    }
    return [true, user]

}

/**
 * Try to get the gmail of a user
 */
function tryGetGmailOf(user){
    if (user[accounts]){
        for (i in user[accounts]){
            let acc = user[accounts][i]
            if (acc.accType == googleAcc){
                return acc[email]
            }
        }
    }
    return ""
}


/**
 * Ensures a json object has an entry, if not use init to initialize the entry
 */
function ensure(json, str, init){
    let check = json[str]
    if (!check){
        json[str] = init
        check = json[str]
    }
    return check
}



/**
 * Invites an email to the Talking Circle by sending an update via Google Calendar API
 */
function inviteEmailToTC(emailAdd){
    if (!validateEmail(emailAdd)){
        return
    }
    attendees.push({email: emailAdd, responseStatus: "needsAction"})
    let eventPatch = {
        attendees: attendees
    }
    calendar.events.patch({
        calendarId: calendarId,
        eventId: eventId,
        resource: eventPatch,
        sendNotifications: true
    })
}
/**
 * Creates an event among emails with a start time and end time through the Calendar API
 */
function createAppointmentAmong(emails, startDateTime, endDateTime, callback){
    let acceptedEmails = []
    for (let i = 0; i < emails.length; i++){
        let email = emails[i]
        if (validateEmail(email)){
            acceptedEmails.push(email)
        }
    }
    
    let insertResource = {
        summary: 'Sorrow to Smiles - Appointment',
        start: {
            dateTime: startDateTime,
            timeZone: 'Asia/Kuala_Lumpur'
        },
        end: {
            dateTime: endDateTime,
            timeZone: 'Asia/Kuala_Lumpur'
        },
        attendees: [
        ],
        reminders: {
            useDefault: false,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10}
            ]
        },
        conferenceData: {
            createRequest: {
                requestId: createID(10),
                conferenceSolutionKey: { type: "hangoutsMeet" },
            },
        },
        sendNotifications: true
    }
    for (let i = 0; i < acceptedEmails.length; i++){
        let email = acceptedEmails[i]
        insertResource.attendees.push({email: email})
    }
    calendar.events.insert({
        calendarId: calendarId,
        resource: insertResource,
        conferenceDataVersion: 1,
    }, function (err, res){
        if (err) console.log(err)
        console.log(res.data.hangoutLink)
        let link = res.data.hangoutLink
        callback(link)
        save()
    })
}
/**
 * Creates a random ID
 */
function createID(length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

//Save File
console.log("Reading save file")
try {
    let rawReadData = fs.readFileSync(savePath)
    saveData = JSON.parse(rawReadData)
} catch (error) {
    //fs.writeFileSync(savePath, "{}");  //Suppress rewriting in case of simple error
    console.log(error);
}
loadTokens()

//Server
console.log("Starting Server...")
app.use(cors())

app.use(express.static(__dirname))

/**
 * Listen to a port, start the server
 */
app.listen(port, () => {
    console.log(`Server is running. Port:${port}`)
})

/**
 * Allows a post request from '/', aka the server URL
 */
app.post('/', function (request, response) {

    console.log("Request => " + request.socket.remoteAddress + " OR/AND " + request.headers['x-forwarded-for'])

    request.on('data', function (data) {

        let jsonPacket = JSON.parse(data)
        console.log(jsonPacket)

        let result = readCommandPacket(jsonPacket)
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
/**
 * Allows a post request from '/telegram', for preparing telegram ids
 */
app.post('/telegram', function(request, response){

    let address = request.headers['x-forwarded-for'].toString().split(',')[0]
    console.log("Telegram Request => " + request.socket.remoteAddress + " OR/AND " + address)

    request.on('data', function (data) {

        let jsonPacket = JSON.parse(data)
        console.log(jsonPacket)

        let result = prepareTelegramID(jsonPacket, address)
        let reply
        if (result[0]){
            console.log("Success Result Generation - %s command", jsonPacket[command])
            reply = result[1]
        }
        else{
            console.error("Telegram Failure: %s command", jsonPacket[command])
            reply = JSON.parse("{\"error\": \"" + result[1] + "\"}")
        }
        response.send(reply)
    });

})
/**
 * Allows a post request from '/telegram/wait', to wait for the server to receive the telegram bot /start call
 */
app.post('/telegram/wait', function(request, response){
    let address = request.headers['x-forwarded-for'].toString().split(',')[0]
    console.log("Telegram Request => " + request.socket.remoteAddress + " OR/AND " + address)

    request.on('data', function (data) {

        console.log("Waiting for Telegram Bot Response")
        waitForTelegramBotResponse(address, function(idData){
            let send = loginRegisterTelegram(idData)
            response.send(send).end()
        });
    });
})

/**
 * Wait for the telegram bot's response from a user for its /start call
 */
async function waitForTelegramBotResponse(ipaddress, execute){
    let breakout = false
    while (true){
        for (let i in telegramPreparedIDs.IDs){
            let idData = telegramPreparedIDs.IDs[i]
            if (idData[address] == ipaddress){
                if (idData[prepared]){
                    execute(idData)
                    breakout = true
                    telegramPreparedIDs.IDs.splice(i, 1)
                    break
                }
            }
        }
        if (breakout){
            break
        }
        await delay(100)
    }
}

/**
 * Serve /uploads for image retrieval
 */
app.use("/uploads", express.static("uploads"))
/**
 * Allows a post request for '/upload' to upload an image file
 */
app.post("/upload", upload.single("file" /* name attribute of <file> element in your form */), (request, response) => {

    console.log("File name = " + request.file.filename)
    let filename = request.file.filename
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
/**
 * Allows a get request to display a sample html code to test the server. Also serves as the entry for Google OAuth2 verification of Auth code
 */
app.get("/", async function(req, res){

    let code = req.query.code
    if (code){
        console.log("Below is Auth Code")
        console.log(code)
    
        const {tokens} = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens);
        
    }


    console.log("GET Call")
    res.setHeader('Content-type','text/html')
    res.sendFile('src/pages/index.html', {root: __dirname })

})

/**
 * Sends check calls
 */
function check(){
    checkPsychiatristImages()
}
/**
 * Checks if any psychiatrist have not uploaded a license for verification
 */
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
                    console.log("Over a day!")
                }
            }
        }
    }
}


prompt.start()

/**
 * Allows direct command entering from the server terminal
 */
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

/**
 * Telegram bot on /start text to allow get login data
 */
bot.onText(/\/start (.+)/, (msg, match) => {
    const botChatID = msg.chat.id;
    const response = match[1]
    for (let i in telegramPreparedIDs.IDs){
        let ctx = telegramPreparedIDs.IDs[i]
        if (ctx[id] == response){
            console.log("Got response of: " + response)
            ctx[chatId] = botChatID
            ctx[username] = msg.chat.username
            ctx[name] = msg.chat.first_name + " " + msg.chat.last_name
            ctx[prepared] = true
            bot.sendMessage(botChatID, "Login accepted. Return to the app to finish logging in");
            return
        }
    }
    bot.sendMessage(botChatID, "Hello. This command is only for when a user presses the 'Log in with Telegram' button. Please use the app instead of typing here");
})


let calendar
let calendarId = "primary"
let eventId
let attendees

/**
 * Fetches the Talking Circle Calendar Event and to test that the authorization has not expired yet
 */
function fetchTCCalendar(){
    calendar = google.calendar({version: 'v3', auth: oauth2Client})
    calendar.events.list({
        calendarId: calendarId,
        timeMin: (new Date()).toISOString(),
        maxResults: 1,
        q: "Sorrow To Smiles Talking Circle",
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The CALENDAR API returned an error: ' + err);
        
        const events = res.data.items;
        if (events.length) {
            events.map((event, i) => {
                attendees = event.attendees
                eventId = event.id
                console.log("Talking Circle Ready (Calendar Ready)")
            })
        }
    })
}
fetchTCCalendar()

console.log("\n--END OF DIRECT EXECUTION--")




