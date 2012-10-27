(function(){		
	var  data 		= { }
		,bot 		= null
		,_ 			= require('underscore')._
		,config		= { }

		
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
		
exports.init = function(_config, _bot){
	config = _config
	bot = _bot
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




})()