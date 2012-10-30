//	basic configuration
var config = {
	 channels	: []
	,server		: "ircnet.clue.be"
	,botName	: "Zulio"
	,realName	: "StatBot"
	,admins		: {
		'fou!fou@q17.pl' : {}
	}
	
	,collectUrls : true
} 


// Get the lib
var  irc 		= require('irc')
	,_ 			= require('underscore')._
	,statBot 	= require('./statBot.js')

// 	Create the bot && connect to server
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
})
statBot.init(config, bot)



// Listen for joins
bot.addListener("join", function(channel, who, message) {
	//	crate basic stats for channel
})

//	listen for messages
bot.addListener("message#", function(nick, to, text, message) {
	//	message on channel :)
	// console.log('MESSAGE >>> '+nick+' , to: '+to)
	// console.log(text)
	// console.log(message)
	statBot.processMessage(nick, to, text, message) 
})

bot.addListener("pm", function(nick, text, msg){
	statBot.processCommand(nick, text, msg)
});


/*
 * 	MESSAGE schema: 
 * 	- nick
 * 	- to - 	channel name (or our nick?)
 * 	- text - message text
 * 	- message - 
 * 		- prefix: fou!fou@q17.pl
 * 		- nick: fou
 * 		- user: fou
 * 		- host: q17.pl
 * 		- command: PRIVMSG
 * 		- rawCommand: PRIVMSG
 * 		- commandType: normal
 * 		- args: [ #niebo, 'text' ]
 * 
 * 
 */ 