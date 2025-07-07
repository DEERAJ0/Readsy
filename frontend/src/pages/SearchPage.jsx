import { useNavigate } from "react-router"
import { useState } from "react";
import { useEffect } from "react";
import { useBookStore } from "../store/bookStore.js";
import { Link} from "react-router-dom";


const SearchPage = () => {

    const navigate = useNavigate();
    const [searchTerm,setSearchTerm] = useState("");
    const { searchBooks,books } = useBookStore();



    const handleSubmit = async (e) =>{
      e.preventDefault();

      const urlParams = new URLSearchParams(window.location.search);

      urlParams.set("searchTerm",searchTerm)

      const searchQuery = urlParams.toString();

      await searchBooks(searchQuery);

      navigate(`/search?${searchQuery}`);
    };

    useEffect(()=>{
      const urlParams = new URLSearchParams(location.search);
      const searchTermFromUrl = urlParams.get("searchTerm");

      if(searchTermFromUrl){
        const searchQuery = urlParams.toString();

        searchBooks(searchQuery)

        setSearchTerm(searchTermFromUrl)
      }
    },[searchBooks]);

    console.log("Search Result: ",books)

  return (
    <div className="min-h-screen text-[#252422] bg-[#f5f5f5] px-4 md:px-12 pb-10">
      <p className="cursor-pointer py-3" 
      onClick={()=> navigate("/")}>&larr; Back</p>

      <div className="w-full h-full flex flex-col justify-center items-center">
         <form 
       onSubmit={handleSubmit} 
       value={searchTerm}
       className="relative w-full max-w-sm md:max-w-xl lg:max-w-xl
       text-base lg:text-lg">
        <input 
        value={searchTerm} 
        onChange={(e)=> setSearchTerm(e.target.value)} 
        type="text" 
        placeholder="e.g. Culture Code"
        className="w-full px-3 py-1.5 md:py-2 text-[#252422] rounded-lg bg-[#fffcf2]
        border border-gray-500"/>

        <button 
        type="submit" 
        className="absolute right-0 top-0 bottom-0
        bg-[#403d39] px-4 border-white font-semibold rounded-r-lg
        text-[#f5f5f5] ">Search</button>

       </form>
      </div>

      <h1 className="font-semibold pt-8 pb-6 text-xl md:text-2xl">Search Results</h1>

      {books.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-5 lg:gap-8 max-w-6xl mx-auto">
        {books.map((book,index)=>(
            <Link key={index} to={`/book/${book._id}`} className="block">
                <div className="cursor-pointer w-36 md:w-40mxl:w-44 shadow-sm
                hover:shadow-md rounded-b-md">
                   <div className="h-48 md:h-52 xl:h-60 bg-gray-900">
                    <img 
                    src={book.image} 
                    alt="book_img" 
                    className="w-full h-full object-cover object-center" />
                   </div>

                   <div className="p-2">
                    <h2 className="mb-2 font-semibold text-base md:text-lg">{book.title}</h2>
                    <p className="text-sm md:text-base">{book.author}</p>
                   </div>
                </div>
            </Link>
        ))}
      </div>
      ):<p>No Book found</p>}
    </div>
  )
}

export default SearchPage
