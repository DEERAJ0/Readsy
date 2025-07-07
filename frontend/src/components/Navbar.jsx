import React from 'react'
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

const Navbar = () => {
  const {user,logout} = useAuthStore();
  console.log("User:",user)

  const handleLogout = async ()=>{
    const {message}=await logout();
    toast.success(message);
  }
  return (
    <nav className='bg-[#252422] flex justify-between items-center text-[#FFFCF2] px-4 md:px-12 py-4 md:py-6'>

       <Link to='/'> <label className='font-semibold tracking-wider md:text-lg lg:text-xl cursor-pointer'>Readsy</label>
        </Link>

        {user ? (
          <div className='flex items-center space-x-5 md:text-lg cursor-pointer'>
           <Link to={'/addBook'}><p className='bg-[#403D39] px-3 py-2'>Add book</p></Link>
          

          <p onClick={handleLogout}>Logout({user.username})</p>
          </div>
        ) : (
        <div className='flex items-center space-x-5 md:text-lg cursor-pointer'>
            <Link to={'/login'}><p>Add book</p></Link>
            <Link to={'/login'}><p>Login</p></Link>
            <Link to={'/signup'}><p className='bg-[#403D39] px-3 py-2'>SignUp</p></Link>
        </div>
        )}
    </nav>
  )
}

export default Navbar
