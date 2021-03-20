function createHeaders() {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  return headers;
}

function getFormData(formID) {
  const form = document.getElementById(formID);
  return Object.values(form).reduce((obj, field) => {
    if (field.type != "submit") {
      obj[field.name] = field.value;
    }
    return obj;
  }, {});
}

function deleteTask(event) {
  event.preventDefault(); // debugging -  prevent the page from refreshing
  const formData = getFormData("delete-task-form");

  const headers = createHeaders();

  const data = JSON.stringify({
    taskId: "b3d8b122-67ab-4e29-8f81-6ad4059974d9", // formData.task - for now the value is hardcoded for
  });

  const requestOptions = {
    method: "DELETE",
    headers: headers,
    body: data,
    redirect: "follow",
  };

  fetch("https://xckwrl3df7.execute-api.us-east-1.amazonaws.com/dev", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      console.log(result.body);
    })
    .catch((error) => console.log("error", error.message));
}

function addTask(event) {
  event.preventDefault(); //debugging - prevent the page from refreshing

  // getting the form data
  const formData = getFormData("add-task-form");

  // instantiate a headers object
  const headers = createHeaders();

  const data = JSON.stringify({
    classroom: 2, // hardcoded int
    title: formData.title,
    deadline: formData.deadline,
    student: 2, // hardcoded int
    done: false,
    addedBy: 1, //hardcoded int
  });

  // create a JSON object with parameterrs for API call
  const requestOptions = {
    method: "POST",
    headers: headers,
    body: data,
    redirect: "follow",
  };

  // make API call and use promises to get response
  fetch("https://xckwrl3df7.execute-api.us-east-1.amazonaws.com/dev", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      console.log(result.body);
    })
    .catch((error) => console.log("error", error.message));
}
