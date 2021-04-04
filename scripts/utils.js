function logout() {
  sessionStorage.removeItem('EduMonitor_Session')
  window.location = './index.html'
}
