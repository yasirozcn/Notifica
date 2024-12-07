import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';


export default function IndexPage() {

const navigate = useNavigate(); // React Router yönlendirme

  return (
      <div>
        <ul className='flex gap-6'>
          <li 
          className='group flex items-center justify-center px-6 border-2 bg-[#9ebf3f] gap-2 rounded-[48px] cursor-pointer hover:border-[#9ebf3f] hover:bg-slate-200 transition duration-150 ease-in'
          onClick={() => navigate('/sign-in')} // Yönlendirme

          >
            <Link to="/sign-in" className='text-slate-200 font-bold group-hover:text-[#9ebf3f]'>Log In</Link>
          </li>
          <li 
          className='group py-3 px-6 border-2 border-[#9ebf3f] gap-2 rounded-[48px] cursor-pointer hover:bg-slate-200  transition duration-150 ease-in'
          onClick={() => navigate('/sign-up')} // Yönlendirme
          >
            <Link to="/sign-up" className='text-[#9ebf3f] font-bold '>Register</Link>
          </li>
        </ul>
      </div>
  )
}