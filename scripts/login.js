const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc');

window.onload = function() {
  if (sessionStorage.getItem('user')) {
    window.location= './tasks.html';
  }
}

async function signin(event) {
  event.preventDefault();

  const formData = new FormData(document.forms.FormSignIn);
  
  try {
    const profile = await client.Users.userLogin(formData.get('email'), formData.get('password'));
    storeUser(JSON.parse(profile.body));
    window.location = './tasks.html';
  } catch (err) {
    alert('Cannot login: ' + err.message);
  }
}

async function signup(event) {
  event.preventDefault();
  const formData = new FormData(document.forms.FormSignUp);
  const user = {
    email: formData.get('email'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    role: formData.get('role'),
  };
  const password = formData.get('password');

  try {
    let profile = await client.Users.userSignup(user, password);
    profile = JSON.parse(profile.body);
    // save the name, email, role into sessionStorage?
    storeUser(profile);
    window.location = './tasks.html';
  } catch (err) {
    alert('Cannot login:  ' + err.message);
  }
}

function storeUser(profile) {
  const loggedInUser = {
    id: profile.id,
    firstName: profile.user.firstName,
    lastName: profile.user.lastName,
    email: profile.user.email,
    role: profile.user.role,
  };
  sessionStorage.setItem('user', JSON.stringify(loggedInUser));
}
