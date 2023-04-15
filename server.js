require('dotenv').config()
const multer=require('multer');
const express=require('express');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const File = require("./models/File");

const upload=multer({dest:'uploads'});
const app=express()
app.use(express.urlencoded({extended:true}));
const dburl='mongodb+srv://sharath:9345700012@cluster0.yc4y8ec.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dburl,{useNewUrlParser:true,useUnifiedTopology:true})
.then((result)=>console.log(app.listen(process.env.PORT)))
.catch((err)=>console.log(err));

app.set("view engine","ejs");
app.get('/',(req,res)=>
{
    res.render("index");
})

app.post('/upload',upload.single("file"),async (req,res)=>
{
    const fileData = {
        path: req.file.path,
        originalname: req.file.originalname,
      }
      if (req.body.password != null && req.body.password !== "") {
        fileData.password = await bcrypt.hash(req.body.password, 10)
      }
    
      const file = await File.create(fileData)
      console.log(file);
      console.log(file.originalname);
      //res.render("index");
      //res.render("index",{filelink:`${req.header.origin}/file/${file.id}`});
      res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}` })
})

  app.route("/file/:id").get(handleDownload).post(handleDownload)
async function handleDownload(req, res) {
  const file = await File.findById(req.params.id)

  if (file.password != null) {
    if (req.body.password == null) {
      res.render("password")
      return
    }

    if (!(await bcrypt.compare(req.body.password, file.password))) {
      res.render("password", { error: true })
      return
    }
  }

  file.downloadCount++
  await file.save()
  console.log(file.downloadCount)

  res.download(file.path, file.originalName)
}
