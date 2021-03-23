const client = Client.create('https://5ga1qnpnq0.execute-api.us-east-1.amazonaws.com/jsonrpc');

(async () => {
    // const classrooms = await client.Users.listClassrooms()
    await new Promise((resolve, reject) => setTimeout(resolve, 500 + (Math.random() * 500)))

    const classrooms = [{
        id: 1,
        course: 'History',
        instructor: 'Matthew Fisher',
        students: '49/50',
    }, {
        id: 1,
        course: 'French',
        instructor: 'Blandine Reine',
        students: '35/40',
    }, {
        id: 1,
        course: 'English',
        instructor: 'John Smith',
        students: '30/35',
    }]
    let i = 1;
    classDropDown.innerHTML = classrooms.map(classroom => `
        <tr>
            <th scope="row">${i++}</th>
            <td>${classroom.course}</td>
            <td>${classroom.instructor}</td>
            <td>${classroom.students}</td>
        </tr>
    `).join('')
})().catch(err => alert('Cannot fetch classrooms: ' + err.message))