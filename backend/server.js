import express from "express";
import dotenv from 'dotenv';
import { connectToDB } from "./config/db.js";
import User from "./model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from 'cors';
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from 'cloudinary';
import Book from "./model/bookModel.js";
import path from 'path';

dotenv.config({ path: '../.env' });

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET,
});


const app = express();

const PORT = process.env.PORT || 5000;

console.log("PORT is ",process.env.PORT)

const __dirname = path.resolve();

//middleware
app.use(cors({origin: "http://localhost:5173",credentials:true}))
app.use(express.json({limit:"20mb"}));
app.use(cookieParser());

// sign up

app.post("/api/signup",async (req,res)=>{
    const {username,email,password} = req.body;

    try {
        if(!username || !email || !password){
            throw new Error("All fields are required");
        }

        const emailExists = await User.findOne({email});

        if(emailExists){
            return res.status(400).json({message:"User already exits"})
        }

        const usernameExists = await User.findOne({username});

        if(usernameExists){
            return res.status(400).json({message:"Username already exits"})
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password,10);
        const userDoc = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        //JWT
        if(userDoc){
            const token = jwt.sign({id: userDoc._id},process.env.JWT_SECRET,{
                expiresIn:"7d",
            });

            res.cookie("token",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict",
                maxAge:7*24*60*60*1000,
            });
        }

        return res.status(200).json({user:userDoc,message:"User created successfully"});


    } catch (error) {
      res.status(400).json({message:error.message})
    }
});


//login
app.post("/api/login",async (req,res)=>{
    const {email,password }= req.body;

    try{
      const userDoc = await User.findOne({email});

      if(!userDoc){
        return res.status(400).json({message:"Invalid credentials"});
      }

      const isPassword = await bcrypt.compareSync(password,userDoc.password);

      if(!isPassword){
        return res.status(400).json({message:"Invalid credentials"});
      }

      //jwt
      if(userDoc){
            const token = jwt.sign({id: userDoc._id},process.env.JWT_SECRET,{
                expiresIn:"7d",
            });

            res.cookie("token",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict",
                maxAge:7*24*60*60*1000,
            });
        }

        return res.status(200).json({user:userDoc,message:"Logged in successfully"});


    } catch (error){
      res.status(400).json({message:error.message})
    }
})

//fetch user
app.get("/api/fetch-user",async (req,res)=>{
    const {token }= req.cookies;

    if(!token){
        return res.status(401).json({message:"No token provided"}); 
    }

    try {
      const decoded = jwt.verify(token,process.env.JWT_SECRET);

      if(!decoded){
        return res.status(401).json({message:"Invalid token"});
      }

      const userDoc = await User.findById(decoded.id).select("-password");

      if(!userDoc){
        return res.status(400).json({message: "User not found"});
      }

      res.status(200).json({user:userDoc});
    } catch (error) {
      res.status(400).json({message: error.message})
    }
})

app.post("/api/logout",async (req,res)=>{
    res.clearCookie("token");
    res.status(200).json({message: "Logged out successfully"});
});

// ========= Book ==========

app.post("/api/addBook",async (req,res)=>{
  const {image,pdf,title,subtitle,author,review} = req.body;
  const {token} = req.cookies;
  if(!token){
    return res.status(401).json({message:"No token provided"});
  }

  try {

    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    if(!decoded){
      return res.status(401).json({message:"Invalid token"});
    }

    //image process

    const imageResponse = await cloudinary.uploader.upload(image, {
      folder: "Readsy/images",
    });

    const pdfResponse = await cloudinary.uploader.upload(pdf, {
      folder: "Readsy/pdfs",
      resource_type: "auto",
    });

    //console.log("Image Response:",imageResponse);
    //console.log("Pdf response:",pdfResponse)

    const userDoc = await User.findById(decoded.id).select("-password");

    const book = await Book.create({
      image: imageResponse.secure_url,
      pdf: pdfResponse.secure_url,
      title,
      subtitle,
      author,
      review,
      user: userDoc
    });

    return res.status(200).json({book,message:"Book added successfully"})

  } catch (error) {
    res.status(400).json({message:error.message})
  }
});

app.get("/api/fetchBooks",async (req,res)=>{
    try {
      const books = await Book.find().sort({createdAt: -1});

      return res.status(200).json({ books });
    } catch (error){
      res.status(400).json({message:error.message});
    }
});

app.get("/api/search",async (req,res)=>{
  try {
    const searchTerm = req.query.searchTerm || "";

    const books = await Book.find({
      title: {$regex: searchTerm, $options:"i"},
    }).sort({createdAt:-1});

    return res.status(200).json({ books });

  } catch (error){
    res.status(400).json({message:error.message});
  }
});

app.get("/api/fetchBook/:id",async (req,res)=>{
  try {
    const {id} = req.params;

    const book = await Book.findById(id).populate("user",["username"]);

    return res.status(200).json({book});

  } catch (error) {
    res.status(400).json({message:error.message});
  }
});

app.delete("/api/deleteBook/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Delete image
    const imageParts = book.image.split("/");
    const imageFile = imageParts[imageParts.length - 1];
    const imagePublicId = imageFile.split(".")[0];

    const imageDeleteResult = await cloudinary.uploader.destroy(
      `Readsy/images/${imagePublicId}`
    );
    console.log("Image deleted:", imageDeleteResult);

    // Delete PDF
    const pdfParts = book.pdf.split("/");
    const pdfFile = pdfParts[pdfParts.length - 1];
    const pdfPublicId = pdfFile.split(".")[0];

    const pdfDeleteResult = await cloudinary.uploader.destroy(
      `Readsy/pdfs/${pdfPublicId}`,
    );
    console.log("PDF deleted:", pdfDeleteResult);

    // Delete from DB
    await Book.findByIdAndDelete(id);

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(400).json({ message: error.message });
  }
});


app.post("/api/updateBook/:id", async (req, res) => {
  const { image, pdf, title, subtitle, author, review } = req.body;
  const { token } = req.cookies;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const updateData = { title, subtitle, author, review };

    // If new image is provided
    if (image) {
      const parts = book.image.split("/");
      const fileName = parts[parts.length - 1];
      const imageId = fileName.split(".")[0];

      await cloudinary.uploader.destroy(`Readsy/images/${imageId}`);
      const imageResponse = await cloudinary.uploader.upload(image, {
        folder: "Readsy/images",
      });

      updateData.image = imageResponse.secure_url;
    }

    // If new PDF is provided
    if (pdf) {
      const pdfParts = book.pdf.split("/");
      const pdfFileName = pdfParts[pdfParts.length - 1];
      const pdfPublicId = pdfFileName.split(".")[0];

      await cloudinary.uploader.destroy(`Readsy/pdfs/${pdfPublicId}`, {
        resource_type: "raw",
      });

      const pdfResponse = await cloudinary.uploader.upload(pdf, {
        folder: "Readsy/pdfs",
        resource_type: "auto",
      });

      updateData.pdf = pdfResponse.secure_url;
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      book: updatedBook,
      message: "Book updated successfully",
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname,"/frontend/dist")));

  app.get("/*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
  })
}

app.listen(PORT,async ()=>{
    await connectToDB();
    console.log("server is listeing at port:",PORT)
})
