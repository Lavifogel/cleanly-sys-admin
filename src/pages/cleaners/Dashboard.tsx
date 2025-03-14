
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CleanerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the home page
    navigate('/cleaners/dashboard');
  }, [navigate]);

  return null;
};

export default CleanerDashboard;
