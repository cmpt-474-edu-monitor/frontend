const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc')
const user = JSON.parse(window.sessionStorage.getItem('user'))

window.onload = function () {
  updateAccountInformation()

  if (user.role == 'STUDENT') {
    $('#add-guardian-button').removeClass('invisible')
    $('#delete-guardian-button').removeClass('invisible')
  }
}

// async function listGuardians() {
//   try {
//     const list = await client.Users.listGuardians()
//   } catch (err) {
//     alert('Cannot get list of guardians: ' + err.message)
//   }
// }

async function updatePassword(event) {
  event.preventDefault()
  const formData = new FormData(document.forms.UpdatePasswordForm)
  const newPassword = formData.get('newPassword')
  const oldPassword = formData.get('oldPassword')
  try {
    await client.Users.updatePassword(newPassword, oldPassword)
    alert('Successfully Updated Password!')
    $('#UpdatePasswordForm').trigger('reset')
  } catch (err) {
    alert('Cannot update password: ' + err.message)
  }
}

async function updateProfile(event) {
  event.preventDefault()
  const formData = new FormData(document.forms.UpdateProfileForm)
  const payload = {
    email: formData.get('email') || undefined,
    firstName: formData.get('firstName') || undefined,
    lastName: formData.get('lastName') || undefined,
    role: undefined,
  }
  try {
    const user = await client.Users.updateProfile(payload)
    updateAccountInformation(user)
    $('#UpdateProfileForm').trigger('reset')
  } catch (err) {
    alert('Cannot update profile: ' + err.message)
  }
}

async function addGuardian(event) {
  event.preventDefault()
  const formData = new FormData(document.forms.AddGuardianForm)
  const email = formData.get('guardianEmail')
  try {
    await client.Users.addGuardian(email)
    alert(`Successfully added ${email}!`)
    $('#AddGuardianForm').trigger('reset')
  } catch (err) {
    alert('Cannot add guardian: ' + err.message)
  }
}

async function removeGuardian(event) {
  event.preventDefault()
  const formData = new FormData(document.forms.RemoveGuardianForm)
  const email = formData.get('guardianEmail')
  try {
    await client.Users.removeGuardian(email)
    alert(`Removed ${email}!`)
    $('#RemoveGuardianForm').trigger('reset')
  } catch (err) {
    alert('Cannot delete guardian: ' + err.message)
  }
}

function updateAccountInformation() {
  $('#nameDisp').html(`${user.firstName} ${user.lastName}`)
  $('#emailDisp').html(user.email)
  $('#roleDisp').html(user.role)
}
