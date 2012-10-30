(function(){		
	var  data 		= { }
		,bot 		= null
		,_ 			= require('underscore')._
		,config		= { }
		,stats		= { }
		,publicCommands = ['!top10', '!top', '!url']
		,fs 		= require('fs')

	 	
var 
cli_admin = function(command, args, nick){
	/** 
	 * 	Available commands: 
	 * 	
	 * 	`admin add [mask]`
	 * 		add user [mask] with admin privileges
	 * 	`admin remove [mask]`
	 * 		remove user [mask] from admins
	 *	`admin show`
	 * 		list all users with admin privileges
	 */
	switch(command){
		case 'add': 
			if ( args.length === 0 ) {
				bot.say(nick, 'add what?')
				return
			}
			if ( config.admins[args[0]] ) {
				bot.say(nick, 'user already on the list')
				return
			}
			config.admins[args[0]] = {}
			bot.say(nick, 'user: '+args[0]+' added to admins list')
			break
		case 'remove':
		case 'delete':
			if ( args.length === 0 ) {
				bot.say(nick, 'remove what?')
				return
			}
			if ( !config.admins[args[0]] ) {
				bot.say(nick, 'user not found')
				return
			}
			delete config.admins[args[0]]
			bot.say(nick, 'user '+args[0]+' was removed')
			break
		case 'show':
		case 'list':
			bot.say(nick, 'All admins: ')
			for (admin in config.admins) {
				bot.say(nick, '=> '+admin)
			}
			bot.say(nick, '.')
			break
		default:
			bot.say(nick, 'command `'+command+'` not recognized. Available admin commands: add, remove, show')
			break
	}
	
	//	check if user is already in database
	
	//config.admins.push(cmd[1])
	// bot.say(nick, command)
	// bot.say(nick, args.join(' # '))
}
,cli_help = function(nick){
	bot.say(nick, '*** StatBot ***')
	bot.say(nick, 'Commands: ')
	bot.say(nick, '* admin show')
	bot.say(nick, '* admin add {mask}')
	bot.say(nick, '* admin remove {mask}')
	bot.say(nick, '* join {channel}')
	bot.say(nick, '* part {channel}')
	bot.say(nick, '.')
}
,cli_publicCommand = function(nick, channel, text, msg){
	switch (text.split(' ')[0]) {
		case '!top10':
		case '!top':
			var  message = []
				,user
				,userStats
				,position = 1
			
			//	sort data
			userStats = _.sortBy(stats[channel], function(userData){
				return -userData.words
			})
			//	prepare message
			message.push(' <<<< Top 10 (words) >>> ')
			for (userPrefix in userStats) {
				user = userStats[userPrefix]
				message.push(' '+position+'#')
				message.push(' '+user.nick+': '+user.words)
				if ( position === 10 ) break
				position++
			}
			//	display stats on channel
			bot.say(channel, message.join(' '))
			break
		case '!url':
			switch( text.split(' ')[1]) {
				case 'top':
					//	todo
					break
				case 'last':
				default: 
					var  today = new Date()
						,filename = 'logs/'+channel+'/'+today.getFullYear()+'.urls.log'
					//	load last urls
					if ( !fs.existsSync(filename) ) {
						bot.say(channel, 'Sorry, nie mam żadnych linków dla Ciebie.')
						return
					}
					var  urls = fs.readFileSync(filename).toString().split('\n')
						// last line is empty line
						,url = urls[urls.length-2]
						
					bot.say(channel, 'Znalazlem '+urls.length+' URLi. Ostatni: '+url.split('>>>')[1]+ ' wrzucony przez '+ url.split('>>>')[0].split('%')[2])
					break
				
			}
			break
		default :
			break
	}
}
	
exports.init = function(_config, _bot){
	config = _config
	bot = _bot
	//	load stats from db (todo)
}
exports.processCommand = function(nick, text, msg){
	isAllowed = _.find(config.admins, function(adminData, admin){
		return msg.prefix == admin
	})
	if ( !isAllowed ) {
		bot.say(nick, 'sorry, You can\'t tell me what to do.')
		return
	}
	
	var cmd = text.split(' ')
	if ( !cmd || cmd.length === 0 ) {
		bot.say(nick, 'command not recognized: ')
		bot.say(nick, cmd)
		return
	}
	switch(cmd[0]) {
		case 'join': 
			bot.join(cmd[1])
			break
		case 'part':
			bot.part(cmd[1])
			break
		case 'admin': 
			cli_admin(cmd[1], cmd.slice(2), nick)
			break
		case 'help': 
			cli_help(nick)
			break
		default:
			bot.say(nick, 'try again :)')
			break
	}
}
exports.processMessage = function(nick, channel, text, msg){
	if ( !stats[channel] ) {
		stats[channel] = { }
	}
	if ( !stats[channel][msg.prefix] ) {
		stats[channel][msg.prefix] = {
			 words			: 0
			,wordsPerLine	: 0
			,smileys		: 0
			,nick			: nick
		}
	}
	//	split message
	var	 words = text.split(' ')
		//	get user object
		,user = stats[channel][msg.prefix]
		//	set filename with logs
		,today = new Date()
		,filename, logMessage, url
		,hours, minutes
	
	//	if message is command, process it
	if ( _.indexOf( publicCommands, words[0] ) !== -1 ) {
		cli_publicCommand(nick, channel, text, msg)
		return
	}

	//	update stats for user
	user.words += words.length
	user.wordsPerLine = (user.wordsPerLine+words.length)/2
	
	//	create log folder for this channel
	if ( !fs.existsSync('logs/'+channel) ) {
		fs.mkdirSync('logs/'+channel)
	}
	
	//	save message to log file
	filename = 'logs/'+channel+'/'+today.getFullYear()+'.'+(today.getMonth()+1)+'.log'
	logMessage = ''+today.getDate()+'% '+today.getHours()+':'+today.getMinutes()+' |'+nick+' >>> '+text+'\n'
	fs.appendFileSync(filename, logMessage)
	
	//	check if message contains urls, if yes, save urls to file
	var urlReg = /((!?)\b(https?:\/\/|www\.)(([0-9a-zA-Z_!~*'().&=+$%-]+:)?[0-9a-zA-Z_!~*'().&=+$%-]+\@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-zA-Z_!~*'()-]+\.)*([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z]\.[a-zA-Z]{2,6})(:[0-9]{1,4})?((\/[0-9a-zA-Z_!~*'().;?:\@&=+$,%#-]+)*\/?))/g
	filename = 'logs/'+channel+'/'+today.getFullYear()+'.urls.log'
	for (var i=0, count=words.length;i<count;i++){
		if ( urlReg.test(words[i]) ) {
			//	todo convert logMessage to object and save as serialized
			hours = ( today.getHours()<10 ? '0'+today.getHours() : today.getHours() ) 
			minutes = ( today.getMinutes()<10 ? '0'+today.getMinutes() : today.getMinutes() ) 
			logMessage = ''+today.getDate()+'%'+hours+':'+minutes+'%'+nick+'>>> '+words[i]+'\n'
			fs.appendFileSync(filename, logMessage)
		}
	}
	
	
	
}




})()