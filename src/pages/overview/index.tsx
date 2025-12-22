import { useEffect } from "react";
import KpiCard from "../../components/UI/KpiCard";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import Dashui from "../../components/Dashui";

export default function OverviewPage() {

  const {user,isLogin } = useAuth()
  const navigate = useNavigate()

  useEffect(()=>{
      if(!user&&!isLogin){
          navigate('/login')
      }
    },[user])

  if(user?.role==="student"){
    return <Dashui/>
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Courses"
          value="120"
        />
        <KpiCard
          title="Total Organization"
          value="57"
          
        />
        <KpiCard title="Total Sales" value="$217,027"/>
        <KpiCard
          title="Total Students"
          value="7,273"
          change="200"
          positive

        />
      </div>
    </div>
  );
}
