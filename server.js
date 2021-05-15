const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// const hbs = require('express-handlebars');

const { urlencoded } = require('express');
const User = require('./server/model/userSchema');
const auth = require('./server/middleware/auth') 
require('./server/db/conn')

dotenv.config({path:"config.env"})

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended:false}))

const PORT = process.env.PORT || 5500

// static files

app.use(express.static(path.join(__dirname,'public')))
app.use('/css',express.static(path.resolve(__dirname,'./public/css')))

// View Engine paths

const viewsPath = path.join(__dirname,'./views')
const partialsPath = path.join(__dirname,'./views/partials')

hbs.registerPartials(partialsPath)

app.set('view engine','hbs');
app.set('views',viewsPath)

// calling routes
app.use('/',require('./server/router/router'));

app.post('/register',async(req,res)=>{
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if(password === cpassword){
            const user = new User({
                 name:req.body.name,
                 phone:req.body.phone,
                 email:req.body.email,
                 password:req.body.password,
                 cpassword:req.body.cpassword

            })

            const token = await user.generateToken();

            res.cookie("jwt",token,{
                expires:new Date(Date.now()+600000),
                httpOnly:true
            });

            const result = await user.save();
            res.render("index");

        }else{
            res.send("Password are not matching");
        }

    } catch (error) {
        res.send(error);
    }
})

app.post('/login',async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password

        const userEmail = await User.findOne({email:email})

        const isMatch = await bcrypt.compare(password, userEmail.password)

        const token = await userEmail.generateToken();

        res.cookie("jwt",token,{
            expires:new Date(Date.now()+600000),
            httpOnly:true
        });

        // if(userEmail.password === password){
            if(isMatch){
            res.render('index')
        }else{
            res.send("Invalid Password")
        }

    } catch (error) {
        res.send("Invalid Login Details");
    }
})

app.get('/logout',auth,async(req,res)=>{
    try {

        req.user.tokens = req.user.tokens.filter((currElem)=>{
            return currElem.token != req.token
        })
        
        res.clearCookie("jwt");
        await req.user.save();
        res.render('login')
    } catch (error) {
        res.send(error);
    }
})

app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})

