import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { useBookStore } from "../store/bookStore.js";
import {useNavigate} from "react-router";
import { useParams } from "react-router";

const Updatepage = () => {
  const [image,setImage] = useState("");
  const [pdf,setPdf] = useState("");
  const [title,setTitle] = useState("");
  const [subtitle,setSubtitle] = useState("");
  const [author,setAuthor] = useState("");
  const [review,setReview] = useState("");
  const { updateBook,isLoading,error,fetchBook,book } = useBookStore();
  const navigate = useNavigate();
  const params = useParams();

  const handleImageChange = (e)=>{
    const file = e.target.files[0];
    let reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend =function () {
      setImage(reader.result);
    };
  };

  const handlePdfChange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.readAsDataURL(file); // This will convert the PDF into a base64 string

  reader.onloadend = function () {
    setPdf(reader.result); // assuming you have a state like: const [pdf, setPdf] = useState("");
  };
};


  const handleSubmit = async (e) =>{
    e.preventDefault();

    if(!title || !author){
      toast.error("Please fill in required info")
    }

    const {message} = await updateBook(params.id,image,pdf,title,subtitle,author,review);

    toast.success(message);

    navigate(`/book/${book._id}`);
  };

  useEffect(()=>{
    fetchBook(params.id)
  },[fetchBook,params]);

  useEffect(()=>{
    if(book){
        setTitle(book.title);
        setSubtitle(book.subtitle);
        setAuthor(book.author);
        setReview(book.review);
        //setImage(book.image);  // Add this
        //setPdf(book.pdf); 
    }
  },[book]);

  return (
    <div className="min-h-screen text-[#252422] bg-[#f5f5f5] px-4 md:px-12 pb-16">
      <h2 className="text-center font-semibold pt-8 md:text-2xl w-full max-w-xl mx-auto">
        Update Book
      </h2>

      <form
         onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full max-w-xl mx-auto space-y-4 mt-10"
      >
        {/* Book Cover Image */}
        <div className="flex flex-col w-full">
          <label className="md:text-lg">Book Cover Image: </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-1.5 md:py-2 text-[#252422] rounded-lg bg-white border border-gray-500"
          />
        </div>

        {/* Book PDF File */}
        <div className="flex flex-col w-full">
          <label className="md:text-lg">Upload PDF Book File*: </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            className="w-full px-3 py-1.5 md:py-2 text-[#252422] rounded-lg bg-white border border-gray-500"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="md:text-lg">Title*: </label>
          <input
            type="text"
            value={title}
            onChange={(e)=> setTitle(e.target.value)}
            className="w-full px-3 py-1.5 md:py-2 text-[#252422] rounded-lg bg-white border border-gray-500"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="md:text-lg">Subtitle (optional): </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e)=> setSubtitle(e.target.value)}
            className="w-full px-3 py-1.5 md:py-2 text-[#252422] rounded-lg bg-white border border-gray-500"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="md:text-lg">Author*: </label>
          <input
            type="text"
            value={author}
            onChange={(e)=> setAuthor(e.target.value)}
            className="w-full px-3 py-1.5 md:py-2 text-[#252422] rounded-lg bg-white border border-gray-500"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="md:text-lg">Personal Review (optional): </label>
          <textarea
            rows={4}
            value={review}
            onChange={(e)=> setReview(e.target.value)}
            className="w-full px-3 py-1.5 md:py-2 text-[#252422] rounded-lg bg-white border border-gray-500"
          />
        </div>

        {error && <p className='text-red-500'>{error}</p>}

        <button
          type="submit"
          // disabled={isLoading}
          className="w-full bg-[#403D39] text-[#FFFCF2] py-2 font-medium rounded-lg"
        >
          {isLoading ? "Please wait..." : "Update Book" }
        </button>
      </form>
    </div>
  );
};

export default Updatepage;
