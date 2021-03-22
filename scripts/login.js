const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc');

async function signin() {
    const email = userName.value
    const passwd = userPassword.value

    try {
        // const profile = await client.Users.login(email, passwd)
        await new Promise((resolve, reject) => setTimeout(resolve, 500 + (Math.random() * 500)))
        window.location = './tasks.html'
    } catch (err) {
        alert('Cannot login: ' + err.message)
    }
}