const client = Client.create(window.RPC_ENDPOINT)
const user = JSON.parse(window.sessionStorage.getItem('user'))
const classroomDropdownIds = {
  'enroll-student-button': 'enroll-student-select',
  'withdraw-student-button': 'withdraw-student-select',
}

let CLASSROOMS

window.onload = function () {
  if (user.role == 'EDUCATOR') {
    $('#create-classroom-button').removeClass('invisible')
    $('#enroll-student-button').removeClass('invisible')
    $('#withdraw-student-button').removeClass('invisible')
    $('#enroll-student-email-input').removeClass('invisible')
    $('#withdraw-student-email-input').removeClass('invisible')
    listClassrooms()
  }
  if (user.role == 'STUDENT') {
    $('#enroll-student-button').removeClass('invisible')
    $('#withdraw-student-button').removeClass('invisible')
    listClassrooms()
  }
  if (user.role == 'GUARDIAN') {
    $('#dependent-select').removeClass('invisible')
    populateDependentDropdown()
  }
}

async function listClassrooms() {
  try {
    if (user.role == 'EDUCATOR') {
      CLASSROOMS = await client.Classrooms.listInstructingClassrooms()
    }

    if (user.role == 'STUDENT') {
      CLASSROOMS = await client.Classrooms.listEnrolledClassrooms()
    }

    if (user.role == 'GUARDIAN') {
      const dependentId = $('#dependent-select').val()
      CLASSROOMS = await client.Classrooms.listEnrolledClassrooms(dependentId)
    }

    findInstructors()
  } catch (err) {
    alert('Cannot get list of classrooms: ' + err.message)
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
    await client.Classrooms.withdraw(classroomId, studentEmail)
    CLASSROOMS = CLASSROOMS.filter((classroom) => classroom.id != classroomId)
    findInstructors()
    $('#WithdrawStudentForm').trigger('reset')
  } catch (err) {
    alert('Cannot withdraw student: ' + err.message)
  }
}

function findInstructors() {
  if (user.role == 'STUDENT' || user.role == 'GUARDIAN') {
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
        user.role == 'EDUCATOR'
          ? user.firstName + ' ' + user.lastName
          : classroom.instructorFirstName + ' ' + classroom.instructorLastName
      }</td>
      <td>${classroom.students.length}</td>
    </tr>`)
  })
}

async function getClassrooms(event) {
  if (user.role == 'EDUCATOR' || event.target.id == 'withdraw-student-button') {
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
  let selectId = classroomDropdownIds[event.target.id]
  if (classrooms) {
    mapClassrooms = classrooms
  } else {
    mapClassrooms = CLASSROOMS
  }
  $(`#${selectId}`).empty()
  $(`#${selectId}`).append(`<option selected disabled>Choose Classroom</option>`)
  mapClassrooms.map((classroom) => {
    $(`#${selectId}`).append(
      $('<option>', {
        value: classroom.id,
        text: classroom.title,
      })
    )
  })
}

async function populateDependentDropdown() {
  DEPENDENTS = await client.Users.listDependents(user.id)
  $('#dependent-select').empty()
  $('#dependent-select').append('<option selected disabled>Choose Dependent</option>')
  DEPENDENTS.map((dependent) => {
    $('#dependent-select').append(
      $('<option>', {
        value: dependent,
        text: dependent,
      })
    )
  })
}
