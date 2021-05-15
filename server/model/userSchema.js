const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ("Please insert valid email")
            }
        }
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]

})

// Json Web Token Creating

userSchema.methods.generateToken = async function(){
    try {
        const token = await jwt.sign({_id:this._id},process.env.SECRET_KEY);
        // console.log(token);
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        return token;
    }
    catch (error) {
        console.log(error);
    }
}

// Hashing

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        this.cpassword = await bcrypt.hash(this.cpassword,10);
    }
    next();
})



const User = new mongoose.model('User',userSchema);

module.exports = User;