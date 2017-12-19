/*
 *   This file is part of discord-self-bot
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const Discord = require('discord.js'),
	Matcher = require('did-you-mean'),
	Path = require('path'),
	commando = require('discord.js-commando'),
	data = require('../../data.json'),
	moves = require(Path.join(__dirname, 'data/moves.js')).BattleMovedex,
	{oneLine} = require('common-tags');

module.exports = class moveCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'move',
			'group': 'pokedex',
			'aliases': ['attack'],
			'memberName': 'move',
			'description': 'Get the info on a Pokémon move',
			'examples': ['move {Pokémon Move Name}', 'move Dragon Dance'],
			'guildOnly': false,

			'args': [
				{
					'key': 'move',
					'prompt': 'Get info on which move?',
					'type': 'string',
					'label': 'Move to find'
				}
			]
		});
	}

	capitalizeFirstLetter (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	run (msg, args) {
		const match = new Matcher(Object.keys(moves).join(' ')),
			moveEmbed = new Discord.MessageEmbed();

		let move = moves[args.move.toLowerCase()];

		if (!move) {
			for (let index = 0; index < Object.keys(moves).length; index += 1) {
				if (moves[Object.keys(moves)[index]].num === args.move.toLowerCase()) {
					move = moves[Object.keys(moves)[index]];
					break;
				}
			}
		}
		if (!move) {
			for (let index = 0; index < Object.keys(moves).length; index += 1) {
				if (moves[Object.keys(moves)[index]].name.toLowerCase() === args.move.toLowerCase()) {
					move = moves[Object.keys(moves)[index]];
					break;
				}
			}
		}
		if (move) {

			const accuracyString = move.accuracy ? 'Certain Success' : move.accuracy,
				crystalString = move.isZ ? `${this.capitalizeFirstLetter(move.isZ.substring(0, move.isZ.length - 1))}Z` : 'None',
				descString = move.desc ? move.desc : move.shortDesc,
				targetString = move.target === 'normal' ? 'One Enemy' : this.capitalizeFirstLetter(move.target.replace(/([A-Z])/g, ' $1'));

			moveEmbed
				.setColor(msg.member !== null ? msg.member.displayHexColor : '#FF0000')
				.setThumbnail('https://favna.s-ul.eu/LKL6cgin.png')
				.addField('Description', descString)
				.addField('Type', move.type, true)
				.addField('Base Power', move.basePower, true)
				.addField('PP', move.pp, true)
				.addField('Category', move.category, true)
				.addField('Accuracy', accuracyString, true)
				.addField('Priority', move.priority, true)
				.addField('Target', targetString, true)
				.addField('Contest Condition', move.contestType, true)
				.addField('Z-Crystal', crystalString, true)
				.addField('External Resources', oneLine `
                [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${move.name.replace(' ', '_')}_(move\\))  
                |  [Smogon](http://www.smogon.com/dex/sm/moves/${move.name.replace(' ', '_')})  
                |  [PokémonDB](http://pokemondb.net/move/${move.name.replace(' ', '-')})`);

			if (msg.deletable && data.deleteCommandMessages) {
				msg.delete();
			}

			return msg.embed(moveEmbed, `**${this.capitalizeFirstLetter(move.name)}**`);
		}
		const dym = match.get(args.move), // eslint-disable-line one-var
			dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the move name?';

		if (msg.deletable && data.deleteCommandMessages) {
			msg.delete();
		}

		return msg.channel.send(`⚠️ Move not found! ${dymString}`);
	}
};