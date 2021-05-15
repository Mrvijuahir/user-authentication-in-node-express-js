const jwt = require('jsonwebtoken');
const User = require('../model/userSchema');

const auth = async(req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY)
        // console.log(verifyUser);

        const user = await User.findOne({_id:verifyUser._id})
        // console.log(user);

        req.token = token;
        req.user = user;

        next();

    } catch (error) {
        res.send("Jwt Must be provided");
    }
}

module.exports = auth;