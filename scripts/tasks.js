const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc');

async function addTask(event) {
  event.preventDefault(); // prevents the page from refreshing

  const formData = getFormData('add-task-form');

  try {
    // classroom, student, addedBy is hard coded for now
    // done will always be false when adding a new task
    // returns the task object
    const task = await client.Tasks.addTask(1, formData.title, formData.deadline, 3, false, 1);
    console.log(JSON.parse(task));
  } catch (error) {
    alert('error ' + error.message);
  }
}

async function deleteTask(event) {
  event.preventDefault(); //prevent the page from refreshing

  const formData = getFormData('delete-task-form'); // TODO: get task ID from the form

  try {
    // return the ID of the deleted task
    const deletedTask = await client.Tasks.deleteTask('afe5e1a4-a325-4119-a611-38d8f38dd996');
    alert('success ' + deletedTask);
  } catch (error) {
    alert('error ' + error.message);
  }
}

async function listTasks() {
  try {
    // can query for tasks by studentId and classroomId (optional)
    const tasks = await client.Tasks.listTasks(3);
    console.log(JSON.parse(tasks));
  } catch (error) {
    alert('error ' + error.message);
  }
}

// to load the tasks when the page first loads
// $(document).ready(function () {
//   listTasks();
// });

function getFormData(formID) {
  const form = document.getElementById(formID);
  return Object.values(form).reduce((obj, field) => {
    if (field.type != 'submit') {
      obj[field.name] = field.value;
    }
    return obj;
  }, {});
}
