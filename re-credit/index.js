const express = require('express')
const cors = require("cors");
const app = express()
const port = 3001

app.use(cors());
app.use(express.json())
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
  next();
});

{//USER
const user_model = require('./src/app/api/user/user_model')

app.get('/users', (req, res) => {
  user_model.getUsers()
  .then(response => {
    res.status(200).send(response);
    console.log('Got all users');
  })
  .catch(error => {
    res.status(500).send(error);
  })
})
app.get('/users/:id',(req,res) =>{
    if (isNaN(req.params.id)) {  // Проверяем, что ID - число
    res.status(400).send('Invalid user ID');
    return;
    }
    user_model.getUserByID(req.params.id)
    .then(response => {
        if (!response) {
        res.status(404).send('User not found');
        console.log(`User with ID: ${req.params.id} not found`);
         } else {
        res.status(200).json(response);
        console.log(`Got user with ID: ${req.params.id}.`);
         }
})
    .catch(error =>{
        res.status(500).send(error);
    })
})
app.delete('/users/:id',(req,res) =>{
    if (isNaN(req.params.id)) {  // Проверяем, что ID - число
    res.status(400).send('Invalid user ID');
    return;
    }
    user_model.deleteUser(req.params.id)
    .then(response => {
        if (!response) {
        res.status(404).send('User not found');
        console.log(`User with ID: ${req.params.id} not found`);
         } else {
        res.status(200).json(response);
        console.log(`Deleted user  with ID: ${req.params.id}.`);
         }
})
    .catch(error =>{
        res.status(500).send(error);
    })
})
}
app.listen(port, () => {
  console.log(`Слушаю порт: ${port}.`)
})