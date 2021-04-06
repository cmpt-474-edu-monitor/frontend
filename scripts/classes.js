const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc')

let USER_FIRST_NAME = undefined
let USER_LAST_NAME = undefined
let USER_ROLE = undefined
let CLASSROOMS = undefined

window.onload = function () {
  loadUser()
}

async function loadUser() {
  try {
    const user = await client.Users.me()
    if (user) {
      USER_FIRST_NAME = user.firstName
      USER_LAST_NAME = user.lastName
      USER_ROLE = user.role
      if (USER_ROLE == 'EDUCATOR') {
        $('#create-classroom-button').removeClass('invisible')
        $('#enroll-student-button').removeClass('invisible')
        $('#withdraw-student-button').removeClass('invisible')
        $('#enroll-student-email-input').removeClass('invisible')
        $('#withdraw-student-email-input').removeClass('invisible')
        listInstructingClassrooms()
      }
      if (USER_ROLE == 'STUDENT') {
        $('#enroll-student-button').removeClass('invisible')
        $('#withdraw-student-button').removeClass('invisible')
        listEnrolledClassrooms()
      }
    }
  } catch (err) {
    alert('Cannot load user information: ' + err.message)
  }
}

async function createClassroom(event) {
  event.preventDefault()
  const formData = new FormData(document.forms.CreateClassroomForm)
  const newClassroom = { title: formData.get('classroomTitle') }
  try {
    const classroom = await client.Classrooms.create(newClassroom)
    $('#classroom-table').append(`<tr>
             <td>${classroom.title}</td>
             <td>${USER_FIRST_NAME + ' ' + USER_LAST_NAME}</td>
             <td>${classroom.students.length}</td>
         </tr>`)
    $('#CreateClassroomForm').trigger('reset')
  } catch (err) {
    alert('Cannot create classroom: ' + err.message)
  }
}

async function listInstructingClassrooms() {
  try {
    const listClassrooms = await client.Classrooms.listInstructingClassrooms()
    CLASSROOMS = listClassrooms
    findInstructors()
  } catch (err) {
    alert('Cannot get list of instructing classrooms: ' + err.message)
  }
}

async function listEnrolledClassrooms() {
  try {
    const listClassrooms = await client.Classrooms.listEnrolledClassrooms()
    CLASSROOMS = listClassrooms
    findInstructors()
  } catch (err) {
    alert('Cannot get list of enrolled classrooms: ' + err.message)
  }
}

async function enrollStudent(event) {
  event.preventDefault()
  const formData = new FormData(document.forms.EnrollStudentForm)
  const classroomId = formData.get('classroom')
  const studentEmail = formData.get('studentEmail')
  try {
    const classroom = await client.Classrooms.enroll(classroomId, studentEmail)
    CLASSROOMS = CLASSROOMS.filter((classroom) => classroom.id != classroomId)
    CLASSROOMS.push(classroom)
    findInstructors()
    $('#EnrollStudentForm').trigger('reset')
  } catch (err) {
    alert('Cannot enroll student: ' + err.message)
  }
}

async function withdrawStudent(event) {
  event.preventDefault()
  const formData = new FormData(document.forms.WithdrawStudentForm)
  const classroomId = formData.get('classroom')
  const studentEmail = formData.get('studentEmail')
  try {
    const classroom = await client.Classrooms.withdraw(classroomId, studentEmail)
    CLASSROOMS = CLASSROOMS.filter((classroom) => classroom.id != classroomId)
    findInstructors()
    $('#WithdrawStudentForm').trigger('reset')
  } catch (err) {
    alert('Cannot withdraw student: ' + err.message)
  }
}

function findInstructors() {
  if (USER_ROLE == 'STUDENT') {
    // User.lookup() to get the first name and last name of the instructor for each classroom
    CLASSROOMS.forEach(async (classroom) => {
      try {
        if (classroom.firstName && classroom.lastName) return
        const instructor = await client.Users.lookup({ id: classroom.instructor })
        classroom.instructorFirstName = instructor.firstName
        classroom.instructorLastName = instructor.lastName
        addClassroomsToTable()
      } catch (err) {
        alert('Cannot find instructors for classroom: ' + err.message)
      }
    })
  } else {
    addClassroomsToTable()
  }
}

function addClassroomsToTable() {
  $('#classroom-table').empty()
  CLASSROOMS.map((classroom) => {
    $('#classroom-table').append(`<tr>
      <td>${classroom.title}</td>
      <td>${
        USER_ROLE == 'EDUCATOR'
          ? USER_FIRST_NAME + ' ' + USER_LAST_NAME
          : classroom.instructorFirstName + ' ' + classroom.instructorLastName
      }</td>
      <td>${classroom.students.length}</td>
    </tr>`)
  })
}

async function getClassrooms(event) {
  if (USER_ROLE == 'EDUCATOR') {
    populateClassDropdown(event)
  } else {
    try {
      const classrooms = await client.Classrooms.list()
      populateClassDropdown(event, classrooms)
    } catch (err) {
      alert('Cannot get list of classrooms to populate dropdown: ' + err.message)
    }
  }
}

async function populateClassDropdown(event, classrooms) {
  let mapClassrooms
  if (classrooms) {
    mapClassrooms = classrooms
  } else {
    mapClassrooms = CLASSROOMS
  }
  mapClassrooms.map((classroom) => {
    $(
      `#${
        event.target.id == 'enroll-student-button'
          ? 'enroll-student-select'
          : 'withdraw-student-select'
      }`
    ).append(
      $('<option>', {
        value: classroom.id,
        text: classroom.title,
      })
    )
  })
}

// async function populateDependents(dependents) {
//   try {
//   } catch (err) {
//     alert('Cannot populate dropdown of dependents: ' + err.message)
//   }
// }
