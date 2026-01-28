import React, {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import UserApis from "../apis/UserApis";
import type { UserRole } from "../types/interfaces";

interface User {
  _id: string;
  role: UserRole;
  email: string;
  name?: string;
  phone?: string;
  organisation?: {
    _id: string;
    name: string;
  };
  batch?: {
    _id: string;
    name: string;
  };
  enrolledCourses?: string[];
  points: number;
  streak: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
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
      setIsLoading(true);
      try {
        // Get user by token
        const res = await UserApis.getUserByToken();
        setUser(res.data);
        setLogin(true);
      } catch (error) {
        setUser(null);
        setLogin(false);
      } finally {
        setIsLoading(false);
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
