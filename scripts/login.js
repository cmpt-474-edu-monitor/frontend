const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc')

async function login(event) {
  event.preventDefault()

  const formData = new FormData(document.forms.FormSignIn)

  try {
    const account = await client.Users.login(formData.get('email'), formData.get('password'))
    window.location = './account.html'
  } catch (err) {
    alert('Cannot login: ' + err.message)
  }
}

async function signup(event) {
  event.preventDefault()
  const formData = new FormData(document.forms.FormSignUp)
  const user = {
    email: formData.get('email'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    role: formData.get('role'),
  }
  const password = formData.get('password')

  try {
    const account = await client.Users.signup(user, password)
    window.location = './accounts.html'
  } catch (err) {
    alert('Cannot login:  ' + err.message)
  }
}
