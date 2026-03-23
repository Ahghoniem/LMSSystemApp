import { Outlet } from 'react-router';
import './App.css';
import Footer from './Shared/Footer';
import Navbar from './Shared/Navbar';
import Sidebar from './Shared/Sidebar'; 
import { useState } from 'react';
import { useAuth } from './Context/AuthContext';

function App() {
  const [childData,setChildData] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  const handleChildDataNav = (data) => {
    setChildData(data);
  }
  const handleChildDataSide=(data) => {
    setChildData(data)
  }

  return (
    <div className="app-container">
      {isLoggedIn && <Sidebar isOpen={childData} sendDataToParent={handleChildDataSide} onClose={() => setChildData(false)} />}
      <Navbar sendDataToParent={handleChildDataNav} logout={logout}/>
      <main className="main-content">
        <Outlet/>
      </main>
      <Footer/>
    </div>
  )

}

export default App;
