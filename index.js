const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const winston = require("winston");
const bcrypt = require('bcrypt')
// const pg = require('pg-promise')();
// const db = pg("postgres://fboxoopx:OdHhvN9QYSkHGv60t1mHCOl7TacIEbYG@batyr.db.elephantsql.com/fboxoopx");
const {imbd} = require('./models')
app.use(express.json())
//link ejs/css
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

app.get('/login', (req, res) => {
  logger.info({
      level: 'info',
      method:req.method,
      body:req.body,
      url:req.url,
      parameters:req.params,
      timestamp:new Date().toLocaleString()
  })
  res.render('login')
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    // Find a user in the database by their email
    const user = await imbd.findOne({ where: { email: email } });

    if (!user) {
      return res.status(401).send('Invalid email or password');
    }

    // Compare the provided password with the hashed password from the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Passwords match, so authentication is successful
      logger.info({
        level: 'info',
        method: req.method,
        body: req.body,
        url: req.url,
        parameters: req.params,
        timestamp: new Date().toLocaleString(),
      });

      return res.send('Login successful');
    } else {
      // Passwords don't match, authentication failed
      return res.status(401).send('Invalid email or password');
    }
  } catch (error) {
    console.error('Error while logging in:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/register', async (req, res) => {
    const { name, email, password, repassword } = req.body;
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  // Check if password contains a URL
  if (urlRegex.test(password)) {
    return res.status(400).send('Password should not contain a URL');
}
  //Password complexity check
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%^&*])[A-Za-z\d@#$!%^&*]{8,}$/;

if (!passwordRegex.test(password)) {
    return res.status(400).send('Password does not meet requirements:Need one uppercase, one lowercase, one symbol, and one number');
  } 
  //
    //checks all fields are entered
    if (!name || !email || !password || !repassword) {
        return res.status(400).send('All fields are required');
      //  return res.render('register', { error: "All fields are required" }); --old code 
    }
    //username only string
    const nameRegex = /^[A-Za-z ]+$/; // Allow letters and space

    if (!nameRegex.test(name)) {
    return res.status(400).send('Name should only contain letters and spaces (no numbers or special characters)');
    }
    //
    //check password matches repassword
    if (password !== repassword) {
        return res.status(400).send('Passwords do not match');
        
    }
   //Email existing
    const existingEmail = await imbd.findOne({ where: { email: email } });

  if (existingEmail) {
    return res.status(400).send('Email already registered');
    
  }
    // logger.info({
    //     level: 'info',
    //     method:req.method,
    //     body:req.body,
    //     url:req.url,
    //     parameters:req.params,
    //     timestamp:new Date().toLocaleString()
    // })
    try {
        // Hash the password
        const saltRounds = 10; // You can adjust the number of salt rounds as needed
        const hashedPassword = await bcrypt.hash(password, saltRounds);
    
        // Store the hashed password in the database
        await imbd.create({
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