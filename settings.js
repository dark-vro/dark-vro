const fs = require("fs")

global.creator = "Shefin"
global.MONGO_DB_URI = "mongodb+srv://shefin_web:VNTr2Bm4nD2SIc06@shefin.0mbat0x.mongodb.net/?retryWrites=true&w=majority"
global.ACTIVATION_TOKEN_SECRET = "-@Pqnap+@(/1jAPPnew/@10"
global.your_email = "shefin.web@gmail.com"
global.email_password = "kfip jlgc spud awyk"
global.limitCount = 10000
global.YUOR_PORT = 8000
global.loghandler = {
	noapikey:{
		status: 403,
        message: "Enter apikey!",
        creator: `${creator}`,
        result: "error"
    },
    error: {
        status: 503,
        message: "Service Unavaible",
        creator: `${creator}`
    },
    apikey: {
    	status: 403,
    	message: "Forbiden, Invalid apikey!",
    	creator: `${creator}`
    },
    noturl: {
    	status: 403,
    	message: "Forbiden, Invlid url!",
    	creator: `${creator}`,
    }
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(`Update"${__filename}"`)
	delete require.cache[file]
	require(file)
})
