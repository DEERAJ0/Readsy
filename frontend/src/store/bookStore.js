import {create} from 'zustand';
import axios from 'axios';


const API_URL = "https://readsy-yqw0.onrender.com/api";
axios.defaults.withCredentials=true;

export const useBookStore = create((set)=>({
    //intial sates
    book: null,
    books: [],
    isLoading:false,
    error:null,
    message:null,


    //functions

    addBook: async (image,pdf,title,subtitle,author,review) =>{
      set({isLoading:true,error:null,message:null})

      try {
        const response = await axios.post(`${API_URL}/addBook`,{
            image,
            pdf,
            title,
            subtitle,
            author,
            review
        });

        const {message,book} = response.data;

        set({book,message,isLoading:false});

        return {message,book};

      } catch (error) {
        set({isLoading:false,
        error:error.response.data.message || "Error adding book"
    });
    throw error;
      }
    },

    fetchBooks: async ()=>{
      set({isLoading:true,error:null});

      try{
        const response = await axios.get(`${API_URL}/fetchBooks`);

        set({ books:response.data.books,isLoading:false});
      } catch (error){
        set({isLoading:false,
        error:error.response.data.message || "Error fetching book",
    });
        throw error;
      }
    },

    searchBooks: async (searchTerm)=>{
      set({isLoading:true,error:null});

      try {
        const response = await axios.get(`${API_URL}/search?${searchTerm}`);

        set({books:response.data.books,isLoading:false})
      } catch (error){
        set({isLoading:false,
        error:error.response.data.message || "Error fetching books",
    });
        throw error;
      }
    },

    fetchBook: async (id)=>{
      set({isLoading: true,error:null});

      try{
        const response = await axios.get(`${API_URL}/fetchBook/${id}`);

        set({book: response.data.book,isLoading: false});
      } catch(error){
        set({isLoading:false,
        error:error.response.data.message || "Error fetching book",
    });
        throw error;
      }
    },

    deleteBook: async (id)=>{
      set({isLoading:true,error:null,message:null})

      try{
        const response = await axios.delete(`${API_URL}/deleteBook/${id}`);
        const {message} = response.data;

        set({message,isLoading:false});
        return {message};
      }catch(error){
        set({isLoading:false,
        error:error.response.data.message || "Error deleting book",
    });
        throw error;
      }
    },

    updateBook: async (id,image,pdf,title,subtitle,author,review)=>{
      set({isLoading:true,error:null,message:null});

      try {
        const response = await axios.post(`${API_URL}/updateBook/${id}`,{
          image,pdf,title,subtitle,author,review
        });

       const {message,book}=response.data;

       set({book,message,isLoading:false});

       return {message,book}
      } catch (error){
        set({isLoading:false,
        error:error.response.data.message || "Error updating book",
    });
        throw error;
      }
    }
}));
