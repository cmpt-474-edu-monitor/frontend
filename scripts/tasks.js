const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc');

let GLOBAL_TASKS;

async function addTask(event) {
  event.preventDefault(); // prevents the page from refreshing

  const formData = getFormData('add-task-form');

  try {
    // classroom, student, addedBy is hard coded for now
    // done will always be false when adding a new task
    let task = await client.Tasks.addTask(1, formData.title, formData.deadline, 3, false, 1);
    task = JSON.parse(task);
    GLOBAL_TASKS.push(task);
    $('#add-task-form').trigger('reset');
    addToTable(task);
    populateDropdown(); // re-populate dropdown
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
    let tasks = await client.Tasks.listTasks(3, 1);
    tasks = JSON.parse(tasks);
    GLOBAL_TASKS = tasks;
    addToTable(tasks);
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
      obj[field.name] = field.value;
    }
    return obj;
  }, {});
}

function addItemToTable(item) {
  $('#tasks-table tr:last').after(
    ` <tr id=${item.id}>
    <td>${item.classroom}</td>
    <td>${item.title}</td>
    <td>${item.deadline}</td>
    <td>
      <div>${item.done}</div>
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
  console.log(GLOBAL_TASKS);
  $('#delete-task-select').empty();
  GLOBAL_TASKS.forEach((task) => {
    $('#delete-task-select').append(
      $('<option>', {
        value: task.id,
        text: task.title,
      })
    );
  });
}
