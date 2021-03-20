function getFormData(formID) {
  const form = document.getElementById(formID);
  return Object.values(form).reduce((obj, field) => {
    if (field.type != "submit") {
      obj[field.name] = field.value;
    }
    return obj;
  }, {});
}

function addTask(event) {
  event.preventDefault(); //debugging - prevent the page from refreshing

  // getting the form data
  const formData = getFormData("add-task-form");

  // instantiate a headers object
  const headers = new Headers();
  // add content type header to object
  headers.append("Content-Type", "application/json");

  const data = JSON.stringify({
    classroom: 3, // hardcoded int
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
    .catch((error) => console.log("error", error));
}
