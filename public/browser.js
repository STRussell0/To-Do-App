function itemTemplate(item) {
    return `
    <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.text}</span>
    <div>
      <button class="edit-me btn btn-secondary btn-sm mr-1" data-id="${item._id}">Edit</button>
      <button class="delete-me btn btn-danger btn-sm" data-id="${item._id}">Delete</button>
    </div>
  </li>
    `
}

// Initial Page Load Render
ourHTML = items.map(function(item) {
    return itemTemplate(item)
}).join('')
document.getElementById('item-list').insertAdjacentHTML('beforeend', ourHTML)

// Create feature
let createField = document.getElementById('create-field')

document.getElementById('create-form').addEventListener('submit', function(e) {
    e.preventDefault()
    axios.post('/create-item', {text: createField.value}).then(function(response) { 
       // Create the HTML for a new item
       document.getElementById('item-list').insertAdjacentHTML("beforeend", itemTemplate(response.data))
       createField.value = ''
       createField.focus()
    }).catch(function() { // in case of any errors
        console.log('Please try again later')
    })
})

document.addEventListener('click', function(e) {
    // Delete Feature
    if(e.target.classList.contains('delete-me')) { // If the button I press has a class of "delete-me"
        if (confirm("Do you really want to delete this item permanently?")) { // Send a confirm asking if you really want to
            axios.post('/delete-item', {id: e.target.getAttribute('data-id')}).then(function() { 
                // If so, use axios.post to work with server.js /delete-item, and target the id by using getAttribute data-id (we set this up on the template literal on server.js), then run an anonymous function that will target the item and remove it.
                e.target.parentElement.parentElement.remove()
            }).catch(function() { // in case of any errors
                console.log('Please try again later')
            })
        }
    }
    // Update Feature
    if(e.target.classList.contains('edit-me')) { // If the button I press has a class of "edit-me"
        let userInput = prompt('Enter your desired new text', e.target.parentElement.parentElement.querySelector('.item-text').innerHTML)
        // Send a prompt asking what new text you would like. It is targeting an element with a class of item-text.
        if (userInput) { // If there is a requested change
            axios.post('/update-item', {text: userInput, id: e.target.getAttribute('data-id')}).then(function() {
                // Use axios.post to work with server.js /update-item, and target the userInput variable defined above.
                e.target.parentElement.parentElement.querySelector('.item-text').innerHTML = userInput
                // And finally, replace the text of the element with the class of item-text to the value of userInput 
            }).catch(function() { // in case of errors
                console.log('Please try again later')
            })
        }
    }
})