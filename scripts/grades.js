const client = Client.create(window.RPC_ENDPOINT)
const user = JSON.parse(window.sessionStorage.getItem('user'))
const componentDropdownIds = {
  'update-grade-component-button': 'update-component-select',
  'remove-grade-component-button': 'remove-component-select',
  'post-grade-button': 'post-grade-component-select',
  'update-grade-button': 'update-grade-component-select',
  'remove-grade-button': 'remove-grade-component-select',
}

const studentDropdownIds = {
  'post-grade-button': 'post-grade-student-select',
  'update-grade-button': 'update-grade-student-select',
  'remove-grade-button': 'remove-grade-student-select',
}

let CLASSROOMS
let GRADING_COMPONENTS
let STUDENTS
let DEPENDENTS
let SELECTED_DEPENDENT

window.onload = function () {
  
  if (user.role == 'EDUCATOR') {
    populateClassdropdown()
    $('#add-grade-component-button').removeClass('invisible')
    $('#update-grade-component-button').removeClass('invisible')
    $('#remove-grade-component-button').removeClass('invisible')
    $('#post-grade-button').removeClass('invisible')
    $('#update-grade-button').removeClass('invisible')
    $('#remove-grade-button').removeClass('invisible')
    $('#classroom-select').removeClass('invisible')
    $('#grades-column').removeClass('invisible-column')
  }

  if (user.role == 'STUDENT') {
    populateClassdropdown()
    $('#classroom-select').removeClass('invisible')
    $('#score-column').removeClass('invisible-column')
    $('#comment-column').removeClass('invisible-column')
  }

  if (user.role == 'GUARDIAN') {
    populateDependentDropdown()
    $('#dependent-select').removeClass('invisible')
    $('#score-column').removeClass('invisible-column')
    $('#comment-column').removeClass('invisible-column')
  }
}

async function listDependentClassrooms() {
  if (user.role == 'GUARDIAN') {
    SELECTED_DEPENDENT = $('#dependent-select').val()
    CLASSROOMS = await client.Classrooms.listEnrolledClassrooms(SELECTED_DEPENDENT)
    $('#classroom-select').removeClass('invisible')
    populateClassdropdown()
  }
}

async function listGradingComponents() {
  try {
    const classroomId = $('#classroom-select').val()
    const classroom = CLASSROOMS.find((classroom) => classroom.id == classroomId)
    $('#class-name-grades-table').text(classroom.title)

    if (user.role == 'EDUCATOR') {
      GRADING_COMPONENTS = await client.Grades.listGradingComponents(classroomId)
      if (classroom) {
        if (classroom.students.length != 0) {
          STUDENTS = classroom.students
        }
      }
    }

    if (user.role == 'STUDENT') {
      GRADING_COMPONENTS = await client.Grades.listGrades(classroomId, user.id)
    }

    if (user.role == 'GUARDIAN') {
      GRADING_COMPONENTS = await client.Grades.listGrades(classroomId, SELECTED_DEPENDENT)
    }
    addToGradesTable()
  } catch (err) {
    alert('Cannot load grading component for classroom: ' + err.message)
  }
}

async function addGradingComponent(event) {
  event.preventDefault()
  const formData = new FormData(document.forms.AddGradeComponentForm)
  const component = {
    title: formData.get('title'),
    total: parseInt(formData.get('totalMarks')),
    weight: parseInt(formData.get('weight')),
  }
  const classroomId = $('#classroom-select').val()
  try {
    const addedComponent = await client.Grades.addGradingComponent(classroomId, component)
    GRADING_COMPONENTS.push(addedComponent)
    addToGradesTable()
    $('#AddGradeComponentForm').trigger('reset')
  } catch (err) {
    alert('Cannot add grading component: ' + err.message)
  }
}

async function updateGradingComponent(event) {
  event.preventDefault()
  const formData = new FormData(document.forms.UpdateGradeComponentForm)
  const componentId = formData.get('componentId')
  const component = {
    title: formData.get('title'),
    total: parseInt(formData.get('totalMarks')),
    weight: parseInt(formData.get('weight')),
  }
  try {
    const updatedComponent = await client.Grades.updateGradingComponent(componentId, component)
    GRADING_COMPONENTS = GRADING_COMPONENTS.filter((component) => component.id != componentId)
    GRADING_COMPONENTS.push(updatedComponent)
    addToGradesTable()
    $('#UpdateGradeComponentForm').trigger('reset')
  } catch (err) {
    alert('Cannot update grade component: ' + err.message)
  }
}

async function removeGradingComponent(event) {
  event.preventDefault()
  const componentId = $('#remove-component-select').val()
  try {
    await client.Grades.removeGradingComponent(componentId)
    GRADING_COMPONENTS = GRADING_COMPONENTS.filter((component) => component.id != componentId)
    addToGradesTable()
    $('#RemoveGradeComponentForm').trigger('reset')
  } catch (err) {
    alert('Cannot remove grade component: ' + err.message)
  }
}

async function postGrade(event) {
  event.preventDefault()

  const formData = new FormData(document.forms.PostGradeForm)

  const componentId = formData.get('componentId')
  const studentId = formData.get('studentId')
  const grade = {
    score: parseInt(formData.get('score')),
    comments: formData.get('comments') || undefined,
  }

  try {
    const addedGrade = await client.Grades.postGrade(componentId, studentId, grade)
    const component = GRADING_COMPONENTS.find((component) => component.id == componentId)
    component.grades.push(addedGrade)
    addToGradesTable()
    $('#PostGradeForm').trigger('reset')
  } catch (err) {
    alert('Cannot post grade for student: ' + err.message)
  }
}

async function updateGrade(event) {
  event.preventDefault()

  const formData = new FormData(document.forms.UpdateGradeForm)

  const componentId = formData.get('componentId')
  const studentId = formData.get('studentId')
  const grade = {
    score: parseInt(formData.get('score')),
    comments: formData.get('comments'),
  }

  try {
    const updatedGrade = await client.Grades.updateGrade(componentId, studentId, grade)
    let componentIndex = GRADING_COMPONENTS.findIndex((component) => component.id == componentId)
    GRADING_COMPONENTS[componentIndex].grades = GRADING_COMPONENTS[componentIndex].grades.filter(
      (grade) => grade.student != studentId
    )
    GRADING_COMPONENTS[componentIndex].grades.push(updatedGrade)
    addToGradesTable()
    $('#UpdateGradeForm').trigger('reset')
  } catch (err) {
    alert('Cannot update grade for student: ' + err.message)
  }
}

async function removeGrade(event) {
  event.preventDefault()

  const formData = new FormData(document.forms.RemoveGradeForm)

  const componentId = formData.get('componentId')
  const studentId = formData.get('studentId')

  try {
    await client.Grades.removeGrade(componentId, studentId)
    let componentIndex = GRADING_COMPONENTS.findIndex((component) => component.id == componentId)
    GRADING_COMPONENTS[componentIndex].grades = GRADING_COMPONENTS[componentIndex].grades.filter(
      (grade) => grade.student != studentId
    )
    addToGradesTable()
    $('#RemoveGradeForm').trigger('reset')
  } catch (err) {
    alert('Cannot remove grade for student: ' + err.message)
  }
}


function addToGradesTable() {
  $('#grades-table').empty()
  GRADING_COMPONENTS.map((component) => {
    $('#grades-table').append(`<tr>
      <td>${component.title}</td>
      <td>${component.total.toString()}</td>
      <td>${component.weight.toString()}</td>` + (user.role == 'EDUCATOR' ? component.grade.length ? JSON.stringify(component.grade) : '[]' + '</tr>' : `<td>${component.grade.score}</td> <td>${component.grade.comments}</td>` + '</tr>')
    )
  })
}


// POPULATE DROPDOWN FUNCTIONS

async function populateClassdropdown() {
  try {
    if (user.role == 'EDUCATOR') {
      CLASSROOMS = await client.Classrooms.listInstructingClassrooms()
    }

    if (user.role == 'STUDENT') {
      CLASSROOMS = await client.Classrooms.listEnrolledClassrooms()
    }

    if (user.role == 'GUARDIAN') {
      CLASSROOMS = await client.Classrooms.listEnrolledClassrooms(SELECTED_DEPENDENT)
    }

    if (CLASSROOMS) {
      $('#classroom-select').empty()
      $('#classroom-select').append('<option selected disabled>Choose Classroom</option>')
      CLASSROOMS.map((classroom) => {
        $('#classroom-select').append(
          $('<option>', {
            value: classroom.id,
            text: classroom.title,
          })
        )
      })
    }
  } catch (err) {
    alert('Cannot load list of classrooms: ' + err.message)
  }
}

async function populateDependentDropdown() {
  if (user.role == 'GUARDIAN') {
    DEPENDENTS = await client.Users.listDependents(user.id) 
    $('#dependent-select').empty()
    $('#dependent-select').append('<option selected disabled>Choose Dependent</option>')
    DEPENDENTS.map((dependent) => {
      $('#dependent-select').append(
        $('<option>', {
          value: dependent,
          text: dependent
        })
      )
    })
  }
}

function populateComponentDropdown(event) {
  const selectId = componentDropdownIds[event.target.id]
  $(`#${selectId}`).empty()
  $(`#${selectId}`).append('<option selected disabled>Choose Component</option>')
  GRADING_COMPONENTS.map((component) => {
    $(`#${selectId}`).append(
      $('<option>', {
        value: component.id,
        text: component.title,
      })
    )
  })
}

function populateStudentDropdown(event) {
  const selectId = studentDropdownIds[event.target.id]
  $(`#${selectId}`).empty()
  $(`#${selectId}`).append('<option selected disabled>Choose Student</option>')
  if (STUDENTS.length) {
    STUDENTS.forEach((student) => {
      $(`#${selectId}`).append(
        $('<option>', {
          value: student,
          text: student,
        })
      )
    })
  }
}
