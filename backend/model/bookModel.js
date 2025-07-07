import mongoose from "mongoose"

const bookSchema = new mongoose.Schema({
    image: {type: String,required:true},
    pdf: {type: String,required:true},
    title:{type:String,required:true},
    subtitle: {type: String},
    author: {type: String,required:true},
    review: {type: String},
    user:{type: mongoose.SchemaTypes.ObjectId,ref:"User"}
},{timestamps:true});

const Book = mongoose.models.Book || mongoose.model("Book",bookSchema);

export default Book;