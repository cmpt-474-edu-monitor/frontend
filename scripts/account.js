const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc');

window.onload = function () {
  if (sessionStorage.getItem('user') === null) {
    window.location = './tasks.html'
  } else {
    loadUser();
  }
}

function loadUser() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  $('#nameDisp').html(`${user.firstName} ${user.lastName}`);
  $('#emailDisp').html(user.email);
  $('#roleDisp').html(user.role);
}
