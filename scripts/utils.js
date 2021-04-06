function logout() {
  sessionStorage.removeItem('EduMonitor_Session')
  sessionStorage.removeItem('user')
  window.location = './index.html'
}
