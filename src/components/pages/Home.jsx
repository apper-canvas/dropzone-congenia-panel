import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useAuth } from "@/layouts/Root";
import FileUploader from "@/components/organisms/FileUploader";
import Button from "@/components/atoms/Button";

const Home = () => {
  const { user } = useSelector(state => state.user);
  const { logout } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-purple-50 py-8"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-lg font-bold flex items-center justify-center">
              D
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">DropZone</h1>
              {user && (
                <p className="text-sm text-gray-600">
                  Welcome, {user.firstName} {user.lastName}
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={logout}
            icon="LogOut"
          >
            Logout
          </Button>
        </div>
        <FileUploader />
      </div>
    </motion.div>
  );
};

export default Home;