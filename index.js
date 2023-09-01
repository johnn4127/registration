const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const winston = require("winston");
const bcrypt = require('bcrypt')
// const pg = require('pg-promise')();
// const db = pg("postgres://fboxoopx:OdHhvN9QYSkHGv60t1mHCOl7TacIEbYG@batyr.db.elephantsql.com/fboxoopx");
const {imbd} = require('./models')
app.use(express.json())
app.use(express.static(__dirname + '/public'));
const path = require('path')
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))



const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [

      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });

app.get('/', (req, res) => {
    logger.info({
        level: 'info',
        method:req.method,
        body:req.body,
        url:req.url,
        parameters:req.params,
        timestamp:new Date().toLocaleString()
    })
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { name, email, password, repassword } = req.body;
    //checks all fields are entered
    if (!name || !email || !password || !repassword) {
        return res.status(400).send('All fields are required');
      //  return res.render('register', { error: "All fields are required" }); --old code 
    }
    //check password matches repassword
    if (password !== repassword) {
        return res.status(400).send('Passwords do not match');
        
    }
    //check password length
    if (password.length < 8) {
        return res.status(400).send('Password should be at least 8 characters long');
        // return res.render('register', { error: "" }); ---- change to send error to error log
    }
    // Validate password is numeric
    // console.log(typeof(password))
    // if (typeof (password) !== 'number') {
    //     return res.status(400).send('password should contain only numbers');
        
    // }

    // Check for URLs in password
    // if (containsUrl(password)) {
    //     return res.status(400).send('Invalid input. URLs are not allowed');
    // }
    // // Validate email format
    // if (!isValidEmail(email)) {
    //     return res.render('register', { error: "Invalid email format" });
    // }
    // // Check for existing username and email
    // const existingUser = users.find(user => user.username === name || user.email === email);
    // if (existingUser) {
    //     return res.render('register', { error: "Username or email is already registered" });
    // }
    // logger.info({
    //     level: 'info',
    //     method:req.method,
    //     body:req.body,
    //     url:req.url,
    //     parameters:req.params,
    //     timestamp:new Date().toLocaleString()
    // })
    await imbd.create({
        name: name,
        email: email,
        password: password,
        repassword: repassword})
    try {
        // Hash the password
        const saltRounds = 10; // You can adjust the number of salt rounds as needed
        const hashedPassword = await bcrypt.hash(password, saltRounds);
    
        // Store the hashed password in the database
        await imdb.create({
          name: name,
          email: email,
          password: hashedPassword, // Store the hashed password
          repassword: hashedPassword, // Store the hashed password
        });
    
        logger.info({
          level: 'info',
          method: req.method,
          body: req.body,
          url: req.url,
          parameters: req.params,
          timestamp: new Date().toLocaleString(),
        });
    
        return res.render('register', { success: 'Account created successfully' });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).render('register', { error: 'Failed to create user' });
      }
    });


app.put("/", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Incomplete data" });
    }
})




app.delete('/', (req, res) => {
    const { username } = req.params;

    const userIndex = users.findIndex(user => user.username === username);

    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
    }

    // Remove the user from the array
    const deletedUser = users.splice(userIndex, 1)[0];

    return res.json({ message: "User deleted successfully", deletedUser: deletedUser });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})