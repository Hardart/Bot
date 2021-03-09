function photo(path, filename) {
	const url = await api('photos.getMessagesUploadServer', {
		peer_id: ctx.message.from_id,
		access_token: bot.settings.token
	}).then(url => url.response.upload_url)

	let img = fs.readFileSync(path)
	const form = new FormData()
	form.append('photo', img, {
		contentType: 'img/png',
		name: 'photo',
		filename: filename,
	})
	const object = await fetch(url, {
		method: 'POST',
		body: form
	}).then(obj => obj.json())
	const photo = await api('photos.saveMessagesPhoto', {
		photo: object.photo,
		server: object.server,
		hash: object.hash,
		access_token: bot.settings.token
	}).then(data => {
		let response = data.response[0]
		let attach = 'photo' + response.owner_id + '_' + response.id
		bot.sendMessage(ctx.message.from_id, "", attach)
	})
}

module.exports = photo