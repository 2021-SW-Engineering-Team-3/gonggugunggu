/*
 * import for react
 */
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

/*
 * import for route
 */
import MyHeader from './Header';
import Home from '../Routes/Home';
import Auth from '../Routes/Auth';
import Register from '../Routes/Register';
import Profile from '../Routes/Profile';

/*
 * AppRouter Component
 */
const AppRouter = ({ isLoggedIn, userObj, userDocObj }) => {
  return (
    <Router>
      <MyHeader isLoggedIn={isLoggedIn} userObj={userObj} userDocObj={userDocObj} />
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/register' element={<Register />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
      </main>
    </Router>
  );
};

export default AppRouter;
