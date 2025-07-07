import { Link } from "react-router-dom";



const Footer = () => {
  return (
    <div className="text-[#252422] bg-[#f5f5f5] px-4 md:px-12 md:text-lg">
      <h3 className="border-t border-[#252422] pt-4 pb-6 italic">Designed and developed by <Link to={"/yourlink"} className="text-[#2668C9]">Deeraj Chinni</Link></h3>
    </div>
  )
}

export default Footer
