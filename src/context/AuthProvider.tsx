import React, {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import UserApis from "../apis/UserApis";
// import { useNavigate } from "react-router-dom";
import StudentApis from "../apis/StudentApis";

interface User {
  _id: string;
  role: string;
  email: string;
  name: string;
}

interface AuthContextType {
  isLogin: boolean;
  setLogin: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLogin, setLogin] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        // Try employee/user first
        const res = await UserApis.getUserByToken();
        setUser(res.data);
        setLogin(true);
      } catch (err) {
        try {
          // Fallback to student
          const res = await StudentApis.getStudentByToken();
          setUser(res.data);
          setLogin(true);
        } catch (error) {
          setUser(null);
          setLogin(false);
        }
      }
    };

    fetchAuthUser();
  }, []); // ✅ run once

  return (
    <AuthContext.Provider
      value={{ isLogin, setLogin, user, setUser, isLoading, setIsLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
