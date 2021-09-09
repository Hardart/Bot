const btn = document.querySelector('.uk-button')
btn.innerHTML = 'troy'
function sendRequest(method, url, body) {
	const headers = {
		'Content-Type': 'application/json',
	}
	return fetch(url, {
		method: method,
		body: JSON.stringify(body),
		headers: headers,
	}).then((data) => {
		return data
	})
}

btn.onclick = () => {
	let endpoint = 'http://46.183.163.108/post'
	let body = {
		name: 'john',
	}
	sendRequest('post', endpoint, body)
}
