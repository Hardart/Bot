const fetch = require('node-fetch')
const FormData = require('form-data')
const fs = require('fs')
const api = require('node-vk-bot-api/lib/api')
const Markup = require('node-vk-bot-api/lib/markup')

module.exports = {
	photo: async function (filename, userID, token, bot, mess = '') {
		const url = await api('photos.getMessagesUploadServer', {
			peer_id: userID,
			access_token: token,
		}).then((url) => url.response.upload_url)

		let img = fs.readFileSync('./img/' + filename)
		const form = new FormData()
		form.append('photo', img, {
			contentType: 'img/png',
			name: 'photo',
			filename: filename,
		})
		const object = await fetch(url, {
			method: 'POST',
			body: form,
		}).then((obj) => obj.json())
		await api('photos.saveMessagesPhoto', {
			photo: object.photo,
			server: object.server,
			hash: object.hash,
			access_token: token,
		}).then((data) => {
			const user = data.response[0]
			const attach = 'photo' + user.owner_id + '_' + user.id
			bot.sendMessage(userID, mess, attach)
		})
	},
	newKeybord: function (users) {
		buttons = []
		let summ = users.length
		let columns = 2
		if (summ % 4 == 0 && summ > 5) {
			columns = 4
		} else if (summ % 3 == 0 || summ > 10) {
			columns = 3
		}
		for (let i = 0; i < 10; i++) {
			arrayOfButtons = []
			for (let j = i * columns; j < (i + 1) * columns; j++) {
				if (users[j]) {
					arrayOfButtons.push(users[j])
				}
			}
			if (arrayOfButtons[0]) {
				buttons.push(arrayOfButtons)
			}
		}
		let cancel = Markup.button('Отменить', 'negative', { value: 'cancel' })
		buttons.push([cancel])
		return buttons
	},
	sendRequest: function (method, url, body = null) {
		const headers = {
			'Content-Type': 'application/json',
		}
		return fetch(url, {
			method: method,
			body: body ? JSON.stringify(body) : null,
			headers: headers,
		}).then((obj) => obj.json())
	},
}
