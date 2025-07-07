import { Route, Routes } from "react-router"
import Navbar from "./components/Navbar.jsx"
import HomePage from "./pages/HomePage.jsx"
import AddBook from "./pages/AddBook.jsx"
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import {Toaster} from 'react-hot-toast'
import { useAuthStore } from "./store/authStore.js"
import { useEffect } from "react"
import RedirectAuthenticatedUsers from "./providers/RedirectAuthenticatedUsers.jsx"
import RedirectUnauthenticatedUsers from "./providers/RedirectUnauthenticatedUsers.jsx"
import Footer from "./components/Footer.jsx"
import SearchPage from "./pages/SearchPage.jsx"
import BookPage from "./pages/BookPage.jsx"
import UpdatePage from "./pages/Updatepage.jsx"

function App() {

  const {fetchUser,fetchingUser} = useAuthStore();

  useEffect(()=>{
    fetchUser();
  },[fetchUser]);

  if(fetchingUser) {
    return <p>Loding...</p>
  }
  
  return (
    <>
    <Toaster></Toaster>
    <Navbar></Navbar>
     
     <Routes>
      <Route 
      path={'/'} 
      element={<HomePage></HomePage>}>
      </Route>


      <Route 
      path={'/addBook'} 
      element={<RedirectUnauthenticatedUsers>
        <AddBook></AddBook>
        </RedirectUnauthenticatedUsers>}>
      </Route>


      <Route
       path={'/login'}
       element={<RedirectAuthenticatedUsers>
        <Login></Login>
        </RedirectAuthenticatedUsers>}>
        </Route>


      <Route 
      path={'/signup'} 
      element={<RedirectAuthenticatedUsers>
      <Signup></Signup>
      </RedirectAuthenticatedUsers>}>
      </Route>

      <Route path="/search" element={<SearchPage></SearchPage>}></Route>
      <Route path="/book/:id" element={<BookPage></BookPage>}></Route>
      <Route path="/book/:id/update" element={<UpdatePage></UpdatePage>}></Route>

     </Routes>

     <Footer></Footer>
    </>
  )
}

export default App
