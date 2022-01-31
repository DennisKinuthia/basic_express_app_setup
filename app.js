require("dotenv").config();
require("./config/database").connect();

const express = require("express");

const app = express();

app.use(express.json());


const bcrypt = require("bcryptjs/dist/bcrypt");

const jwt = require("jsonwebtoken");

const User = require("./model/user");


app.post("/register", async (req, res) => {
    try {
        //capture user input
        const {first_name, last_name, email, password} = req.body;

        //validation of user inpput
        if(!(email && password && first_name && last_name)){
            res.status(400).send("fill in all user details");
        }

        // check if user alrleady exists
        const currentUser = await User.findOne({email});

        if(currentUser){
            return res.status(409).send("That email is already registered");
        }

        //encrypt password
        encryptedPassword = await bcrypt.hash(password, 10);

        //add user to the database

        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword
        });

        // create token for the user
        const token  = jwt.sign(
            {user_id: user._id, email},
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );

        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);

    } catch (error) {
        console.log(err);
    }
});

app.post("/login", async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;
    
        // Validate user input
        if (!(email && password)) {
          res.status(400).send("enter your email and password to login");
        }
        // check if user exist in database
        const user = await User.findOne({ email });
    
        if (user && (await bcrypt.compare(password, user.password))) {
          // Create token
          const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
    
          // save user token
          user.token = token;
    
          // user
          res.status(200).json(user);
        }
        res.status(400).json({response: "Invalid Credentials"});
      } catch (err) {
        // console.log(err);
      }
});

const auth = require("./middleware/auth");

app.get("/home", auth, (req, res) => {
    res.status(200).json({response: "Welcom home 👏🏼 🤝 👍🏼"});
})



module.exports = app;