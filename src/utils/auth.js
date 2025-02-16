export const isAuthenticated = () => {
    return !!localStorage.getItem("token"); // Check if token exists in localStorage
  };
  