window.RPC_ENDPOINT = 'https://gull3eqddl.execute-api.us-east-1.amazonaws.com/jsonrpc' // TODO: update this to your own deployment

function logout() {
  sessionStorage.removeItem('EduMonitor_Session')
  sessionStorage.removeItem('user')
  window.location = './index.html'
}
