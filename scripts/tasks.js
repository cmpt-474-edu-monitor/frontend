const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc');

const CLASSROOMS = {
  1: 'History',
  2: 'English',
  3: 'French',
};

const DONE = {
  false: 'Not Done',
  true: 'Done',
};

let GLOBAL_TASKS;

async function addTask(event) {
  event.preventDefault(); // prevents the page from refreshing

  const formData = getFormData('add-task-form');

  const classroom = Object.keys(CLASSROOMS).find((key) => CLASSROOMS[key] === formData.class);

  try {
    // classroom, student, addedBy is hard coded for now
    // done will always be false when adding a new task
    let task = await client.Tasks.addTask(
      classroom,
      formData.title,
      formData.deadline,
      3,
      false,
      1
    );
    task = JSON.parse(task);
    GLOBAL_TASKS.push(task);
    $('#add-task-form').trigger('reset');
    addToTable(task);
  } catch (error) {
    alert('error ' + error.message);
  }
}

async function deleteTask(event) {
  event.preventDefault(); //prevent the page from refreshing

  const formData = getFormData('delete-task-form');

  try {
    const deletedTask = await client.Tasks.deleteTask(formData.task);
    $('#delete-task-form').trigger('reset');
    deleteFromTable(deletedTask);
  } catch (error) {
    alert('error ' + error.message);
  }
}

async function listTasks() {
  try {
    // can query for tasks by studentId and classroomId (optional)
    let tasks = await client.Tasks.listTasks(3);
    tasks = JSON.parse(tasks);
    GLOBAL_TASKS = tasks;
    addToTable(tasks);
  } catch (error) {
    alert('error ' + error.message);
  }
}

async function editTask(event) {
  event.preventDefault();
  const formData = getFormData('edit-task-form');

  const task = {
    id: formData.taskId,
    classroom: Object.keys(CLASSROOMS).find((key) => CLASSROOMS[key] === formData.class),
    title: formData.title,
    deadline: formData.deadline,
    student: parseInt(formData.student),
    done: formData.done,
    addedBy: parseInt(formData.addedBy),
  };

  try {
    await client.Tasks.updateTask(
      task.id,
      task.classroom,
      task.title,
      task.deadline,
      task.student,
      task.done,
      task.addedBy
    );
    // update GLOBAL_TASKS
    GLOBAL_TASKS = GLOBAL_TASKS.filter((t) => t.id != task.id);
    GLOBAL_TASKS.push(task);

    // update table value
    deleteFromTable(formData.taskId);
    addItemToTable(task);

    $('#edit-task-form').trigger('reset');
  } catch (error) {
    alert('error ' + error.message);
  }
}

// to load the tasks when the page first loads
$(document).ready(function () {
  listTasks();
});

function getFormData(formID) {
  const form = document.getElementById(formID);
  return Object.values(form).reduce((obj, field) => {
    if (field.type != 'submit') {
      if (field.type == 'checkbox') {
        obj[field.name] = field.checked;
      } else {
        obj[field.name] = field.value;
      }
    }
    return obj;
  }, {});
}

function addItemToTable(item) {
  $('#tasks-table tr:last').after(
    ` <tr id=${item.id}>
    <td>${CLASSROOMS[item.classroom]}</td>
    <td>${item.title}</td>
    <td>${item.deadline}</td>
    <td>
      <div>${DONE[item.done]}</div>
    </td>
  </tr>`
  );
}

function deleteFromTable(item) {
  $(`#${item}`).remove();
  GLOBAL_TASKS = GLOBAL_TASKS.filter((task) => task.id != item); // remove item from GLOBAL_TASK
  populateDropdown(); // re-populate dropdown
}

function addToTable(items) {
  if (items instanceof Array) {
    items.forEach((item) => {
      addItemToTable(item);
    });
  } else {
    addItemToTable(items); // adding only a single item
  }
}

function populateDropdown() {
  $('#delete-task-select').empty();
  $('#edit-task-select').empty();
  $('#delete-task-select').append(`<option selected disabled>Choose Task</option>`);
  $('#edit-task-select').append(`<option selected disabled>Choose Task</option>`);
  GLOBAL_TASKS.forEach((task) => {
    $('#edit-task-select').append(
      $('<option>', {
        value: task.id,
        text: task.title,
      })
    );
    $('#delete-task-select').append(
      $('<option>', {
        value: task.id,
        text: task.title,
      })
    );
  });
}

function updateEditForm(event) {
  const task = GLOBAL_TASKS.find((task) => task.id == event.value);
  $('#edit-task-classroom').val(CLASSROOMS[task.classroom]);
  $('#edit-task-title').val(task.title);
  $('#edit-task-deadline').val(task.deadline);
  $('#edit-task-done').prop('checked', task.done);
  $('#edit-task-student').val(task.student);
  $('#edit-task-addedBy').val(task.addedBy);
}
