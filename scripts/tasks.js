const client = Client.create(window.RPC_ENDPOINT)

let CLASSROOMS = []

let GLOBAL_TASKS

let USER_ID

const me = JSON.parse(window.sessionStorage.getItem('user'))

// to load the tasks when the page first loads
$(document).ready(async function () {
  try {
    if (me.role === 'STUDENT') {
      USER_ID = me.id
      await populateClassrooms()
      await listTasks()
    }

    if (me.role === 'GUARDIAN') {
      $('#add-task-btn').addClass('invisible')
      $('#edit-task-btn').addClass('invisible')
      $('#remove-task-btn').addClass('invisible')

      $('#dependent-select').removeClass('invisible')
      const dependents = await client.Users.listDependents(me.id)
      $('#dependent-select').empty()
      $('#dependent-select').append('<option selected disabled>Choose Dependent</option>')
      dependents.map((dependent) => {
        $('#dependent-select').append(
          $('<option>', {
            value: dependent,
            text: dependent
          })
        )
      })
    }

    if (me.role === 'EDUCATOR') {
      USER_ID = me.id
      await populateClassrooms()
      await listTasks()
    }

  } catch (err) {
    alert('error ' + err.message)
  }
})

async function populateClassrooms() {
  if (me.role === 'EDUCATOR') {
    CLASSROOMS = await client.Classrooms.listInstructingClassrooms(me.id)
  } else {
    CLASSROOMS = await client.Classrooms.listEnrolledClassrooms(USER_ID)
  }

  window.addTaskClassroomOption.innerHTML = '<option selected disabled>Choose class</option>' +
    CLASSROOMS.map(classroom => `<option value="${classroom.id}">${classroom.title}</option>`).join('\n')
}

async function addTask (event) {
  event.preventDefault() // prevents the page from refreshing

  const formData = getFormData('add-task-form')
  try {
    let task = await client.Tasks.create(formData)
    GLOBAL_TASKS.push(task)
    $('#add-task-form').trigger('reset')
    addToTable(task)
  } catch (error) {
    alert('error ' + error.message)
  }
}

async function deleteTask (event) {
  event.preventDefault() //prevent the page from refreshing

  const formData = getFormData('delete-task-form')

  try {
    await client.Tasks.delete(formData.id)
    $('#delete-task-form').trigger('reset')
    deleteFromTable(formData.id)
  } catch (error) {
    alert('error ' + error.message)
  }
}

async function listTasks () {
  try {
    // can query for tasks by studentId and classroomId (optional)
    let tasks = await client.Tasks.list(USER_ID)
    GLOBAL_TASKS = tasks
    addToTable(tasks)
  } catch (error) {
    console.error(error)
    alert('error ' + error.message)
  }
}

async function editTask (event) {
  event.preventDefault()
  const formData = getFormData('edit-task-form')

  try {
    const task = await client.Tasks.update(formData.id, formData)
    // update GLOBAL_TASKS
    GLOBAL_TASKS = GLOBAL_TASKS.filter((t) => t.id !== task.id)
    GLOBAL_TASKS.push(task)

    // update table value
    deleteFromTable(formData.id)
    addItemToTable(task)

    $('#edit-task-form').trigger('reset')
  } catch (error) {
    alert('error ' + error.message)
  }
}

async function updateCompleteness (id, completed) {
  try {
    await client.Tasks.updateCompleteness(id, completed)
  } catch (error) {
    alert('error ' + error.message)
  }
}

function getFormData (formID) {
  const form = document.getElementById(formID)
  return Object.values(form).reduce((obj, field) => {
    if (field.type != 'submit') {
      if (field.type == 'checkbox') {
        obj[field.name] = field.checked
      } else {
        obj[field.name] = field.value
      }
    }
    return obj
  }, {})
}

function addItemToTable (item) {
  $('#tasks-table tr:last').after(
    ` <tr id=${item.id}>
    <td>${CLASSROOMS.find(classroom => classroom.id === item.classroom).title}</td>
    <td>${item.title}</td>
    <td>${item.deadline}</td>
    <td>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="flexCheckDefault"
            onclick="updateCompleteness('${item.id}', event.target.checked)" 
            ${item.completedStudents.indexOf(USER_ID) !== -1 ? 'checked' : ''}
            ${me.role !== 'STUDENT' ? 'disabled' : ''}
          >
        </div>
    </td>
  </tr>`
  )
}

function deleteFromTable (item) {
  $(`#${item}`).remove()
  GLOBAL_TASKS = GLOBAL_TASKS.filter((task) => task.id != item) // remove item from GLOBAL_TASK
  populateDropdown() // re-populate dropdown
}

function addToTable (items) {
  if (items instanceof Array) {
    items.forEach((item) => {
      addItemToTable(item)
    })
  } else {
    addItemToTable(items) // adding only a single item
  }
}

function populateDropdown () {
  $('#delete-task-select').empty()
  $('#edit-task-select').empty()
  $('#delete-task-select').append(`<option selected disabled>Choose Task</option>`)
  $('#edit-task-select').append(`<option selected disabled>Choose Task</option>`)
  GLOBAL_TASKS.forEach((task) => {
    $('#edit-task-select').append(
      $('<option>', {
        value: task.id,
        text: task.title,
      })
    )
    $('#delete-task-select').append(
      $('<option>', {
        value: task.id,
        text: task.title,
      })
    )
  })
}

function updateEditForm (event) {
  const task = GLOBAL_TASKS.find((task) => task.id == event.value)
  $('#edit-task-classroom').val(CLASSROOMS[task.classroom])
  $('#edit-task-title').val(task.title)
  $('#edit-task-deadline').val(task.deadline)
  $('#edit-task-done').prop('checked', task.done)
  $('#edit-task-student').val(task.student)
  $('#edit-task-addedBy').val(task.addedBy)
}
