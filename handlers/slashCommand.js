const fs = require('fs');
const chalk = require('chalk')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const AsciiTable = require('ascii-table')
const table = new AsciiTable()
table.setHeading('Slash Commands', 'Stats').setBorder('|', '=', "0", "0")

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const rest = new REST({ version: '9' }).setToken(TOKEN);

module.exports = (client) => {
	const slashCommands = []; 

	fs.readdirSync('./slashCommands/').forEach(async dir => {
		const files = fs.readdirSync(`./slashCommands/${dir}/`).filter(file => file.endsWith('.js'));

		for(const file of files) {
				const slashCommand = require(`../slashCommands/${dir}/${file}`);
				slashCommands.push({
					name: slashCommand.name,
					description: slashCommand.description,
					type: slashCommand.type,
				});
				// cooldown: slashCommand.cooldown ? slashCommand.cooldown : 0
			
				if(slashCommand.name) {
						client.slashCommands.set(slashCommand.name, slashCommand)
						table.addRow(file.split('.js')[0], '✅')
				} else {
						table.addRow(file.split('.js')[0], '⛔')
				}
		}
		console.log(chalk.red(table.toString()))
	});

	(async () => {
			try {
				await rest.put(
					process.env.GUILD_ID ?
					Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID) :
					Routes.applicationCommands(CLIENT_ID), 
					{ body: slashCommands }
				);
				console.log(chalk.yellow('Slash Commands • Registered'))
			} catch (error) {
				console.log(error);
			}
	})();
};