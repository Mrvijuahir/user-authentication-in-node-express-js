const Upload = require('../model/imageSchema')
const fs = require('fs');

exports.uploadImg = async(req,res)=>{
    const all_images = await Upload.find();
    res.render('main',{images:all_images});
}

exports.index = (req,res)=>{
    res.render('index')
}

exports.login = (req,res)=>{
    res.render('login');
}

exports.register = (req,res)=>{
    res.render('register');
}

exports.uploads = (req,res,next)=>{
    const files = req.files;
    
    if(!files){
        const error = new Error("Please Choose files");
        error.httpStatusCode = 400;
        return next(error);
    }

    // convert images into base64 encoding

    let imgArray = files.map((file)=>{
        let img = fs.readFileSync(file.path)

        return encode_image = img.toString('base64')
    })

    let result = imgArray.map((src,index)=>{
        // create object to store data into collection
        let finalimage = {
            filename:files[index].originalname,
            contentType:files[index].mimetype,
            imageBase64: src
        }

        let newUpload = new Upload(finalimage);
        
        return newUpload
        .save()
        .then(()=>{
            return {msg:`${files[index].originalname} image uploaded successfully`}
        })
        .catch((error)=>{
            if(error){
                if(error.name === "MongoError" && error.code === 11000){
                    return Promise.reject({error:"Duplicate"})
                }
                return Promise.reject({error:error.message || "can not upload file"})
            }
        })
    });
    Promise.all(result)
    .then(msg=>{
        // res.json(msg);
        res.redirect('/uploadmultiple')
    })
    .catch(err=>{
        res.json(err);
    })
}