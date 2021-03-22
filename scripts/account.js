const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc');



;(async () => {
    // const profile = await client.Users.show()
    await new Promise((resolve, reject) => setTimeout(resolve, 500 + (Math.random() * 500)))

    const profile = {
        name: 'Dummy Student',
        email: 'foo@bar.com',
        role: 'Student'
    }

    nameDisp.innerText = profile.name
    emailDisp.innerText = profile.email
    roleDisp.innerText = profile.role
})().catch(err => alert('Cannot fetch classrooms: ' + err.message))