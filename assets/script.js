const btn = document.querySelector('.uk-button')


function sendRequest(method, url, body) {
	const headers = {
		'Content-Type': 'application/json'
	}
	return fetch(url, {
		method: method,
		body: JSON.stringify(body),
		headers: headers
	}).then(data => {
		return data.json()
	})
}


btn.onclick = () => {
	let endpoint = "http://app.pmsokolova.ru/post"
	let body = {
		name: "hard"
	}
	sendRequest('post', endpoint, body)
		.then(res => {
			for (let i in res) {
				console.log(res[i])
			}
		})
		.catch(err => console.log(err))

}
