import React, { useEffect, useState } from 'react';
import LabelInput from '../components/UI/LabelInput';
import { useNavigate } from 'react-router-dom';
// import { BsMailbox } from 'react-icons/bs';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { GoEye, GoEyeClosed } from 'react-icons/go';
import { CgMail } from 'react-icons/cg';
import { useAuth } from '../context/AuthProvider';
// import UserApis from '../apis/UserApis';
import StudentApis from '../apis/StudentApis';

const StudentLogin: React.FC = () => {
  const {user,setLogin,isLogin,setUser,setIsLoading} = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [formError, setFormError] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate()

  const [show,setShow] = useState<boolean>(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError((prev) => ({ ...prev, [name]: '' })); // Clear error on change
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{8,}$/; // You can make this stronger if needed

    let errors = { email: '', password: '' };
    let hasError = false;

    if (!form.email) {
      errors.email = 'Email is required';
      hasError = true;
    } else if (!emailRegex.test(form.email)) {
      errors.email = 'Please enter a valid email address';
      hasError = true;
    }

    if (!form.password) {
      errors.password = 'Password is required';
      hasError = true;
    } else if (!passwordRegex.test(form.password)) {
      errors.password = 'Password must be at least 8 characters';
      hasError = true;
    }

    if (hasError) {
      setFormError(errors);
      return;
    }
    setIsLoading(true)
    try {
        const res = await StudentApis.signIn(form) 
        setForm({
            email : "",
            password :""
        })
        setFormError({
            email : "",
            password :""
        })
        alert("Login sucessfully")
        setUser(res.data)
        setLogin(true)
        setIsLoading(false)
        navigate('/')
    } catch (error) {
        setIsLoading(false)
        alert((error as any).response?.data.message)
    }

  };


  useEffect(()=>{
    if(user&&isLogin){
        navigate('/')
    }
  },[user])

  return (
    <div className="flex min-h-screen">
      <img src="./logo.png" alt="logo" className=' h-20 fixed m-5' />
      <div className="flex flex-col justify-center items-center w-1/2 px-10 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-2">Welcome Back 👋</h2>
          <p className="text-sm text-gray-500 mb-6">
            Today is a new day. It's your day. You shape it.
            <br />
            Sign in to start managing your projects.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <LabelInput
              name="email"
              label="Email"
              type="email"
              value={form.email}
              error={formError.email}
              onChange={handleChange}
              className=' pl-14 p-3'
              prefixIcon={<CgMail className=' w-8 h-8 mr-5'/>}
            />
            <LabelInput
              name="password"
              label="Password"
              type={show ? "text":"password"}
              value={form.password}
              error={formError.password}
              onChange={handleChange}
              prefixIcon={<LockClosedIcon className=' w-8 h-8'/>}
              className=' pl-14 p-3'
              suffixIcon={show ? <GoEyeClosed className=' w-6 h-6 mr-4 cursor-pointer' onClick={()=>setShow(!show)}/> : <GoEye className=' w-6 h-6 cursor-pointer' onClick={()=>setShow(!show)}/>}
            />

            {/* <div className="text-right text-sm">
              <a href="#" className="text-orange-500 hover:underline">
                Forgot Password?
              </a>
            </div> */}

            <button
              type="submit"
              // disabled={load}
              className="w-full cursor-pointer bg-[#7A5CE0] text-white py-2 p-3 rounded-md hover:bg-[#7A5CE0]/95 transition"
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-xs text-gray-400 text-center">
            © 2025 ALL RIGHTS RESERVED
          </p>
        </div>
      </div>

      <div className="w-1/2 h-screen border-l">
        <img
          src="./6670916.jpg"
          alt="Interior Design"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default StudentLogin;
