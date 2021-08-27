let express = require('express') // Used to activate express
let mongodb = require('mongodb') // Used to activate mongodb
let sanitizeHTML = require('sanitize-html') // Used to protect our app

let app = express(); 

let db

let port = process.env.PORT
if (port == null OR port == "") {
  port = 3000
}

app.use(express.static('public'))

let connectionString = 'mongodb+srv://Jafar:pass@cluster0.ojde6.mongodb.net/TodoApp?retryWrites=true&w=majority'

mongodb.MongoClient.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
  db = client.db()
  app.listen(port)
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

function passwordProtected(req, res, next) { // Creates password protection
  res.set('WWW-Authenticate', 'Basic realm="Simple Todo App"') 
  console.log(req.headers.authorization) // Checks what the user typed into the fields and returns a base 64 encoded text
  if (req.headers.authorization == "Basic SmFmYXI6cGFzcw==") { // if the username and password authorization matches
    next() // Move on to the next argument in all routes.
  } else {
    res.status(401).send("Authentication required") // if not, then send a 401 error.
  }
}

app.use(passwordProtected) // Adds our passwordProtected function to all routes

app.get('/', function(req, res) {
    db.collection('items').find().toArray(function(err, items) {
      res.send(`
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <h1 class="display-4 text-center py-1">To-Do App</h1>
    
    <div class="jumbotron p-3 shadow-sm">
      <form id="create-form" action="/create-item" method="POST">
        <div class="d-flex align-items-center">
          <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary">Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul id="item-list" class="list-group pb-5">

    </ul>
    
  </div>

<script> 
let items = ${JSON.stringify(items)}
</script>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script src="/browser.js"></script>
</body>
</html>
    `)
    });
    
})

app.post('/create-item', function(req, res) { // Works with /create-item
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: []}) // Used our sanitize function to choose which text to sanitize (argument 1) and then what is allowed, which in this case is no tags, and no attributes (argument 2)
  db.collection('items').insertOne({text: safeText}, function(err, info) { // Look into the mongodb database and find the items collection
    // Then use the mongodb method to insert a new text item.
    let data = {"_id": info.insertedId, // Had to create variable instead of using info.ops[0]. Latter is outdated.
                "text": req.body.text  
  }
    res.json(data)
  })
})

app.post('/update-item', function(req, res) { // Works with /update-item
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: []})
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {text: safeText}}, function() { 
    res.send('Success')
  })
})

app.post('/delete-item', function(req, res) {
  db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, function() {
    res.send('Success')
  })
})