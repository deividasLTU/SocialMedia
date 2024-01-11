import React from 'react';
import {BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';
import HomePage from "./pages/Home";
import UserPage from "./pages/User";
import SearchPage from "./pages/Search";
import SettingsPage from "./pages/Settings";
import Nav from "./components/Nav";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import { useLocation, useParams } from 'react-router-dom';
import ForgotPasswordPage from "./pages/ForgotPassword";
import PostExtd from './pages/PostExtd';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import MessagesPage from './pages/Messages';
import GoogleOAuthSuccessRedirect from "./components/GoogleOAuthSuccessRedirect";
import ReportPage from "./pages/CreateReport"
import CreateReport from './pages/CreateReport';
import ResetPage from "./pages/PasswordReset";
import ReportsPage from './pages/Reports';

const UseNav=()=>{
  let location = useLocation();
  const navigate = useNavigate()
    const {params}=useParams();
    console.log(params)
    if(location.pathname.includes("google")){
        return(<></>)
    }else if(location.pathname.includes("/resetPassword/")){
        return(<></>);
    }
  switch (location.pathname){
      case "/login":
          return(<></>);
      case "/":
          if(!localStorage.getItem('accessToken')){
              navigate("/login");
          }
          return(<></>);
      case "/register":
          return(<></>);
      case "/search":
          return(<></>);
      case "/forgotPassword":
          return(<></>);
      case '/google-oauth-success-redirect':
          return (<></>);
      case `/google-oauth-success-redirect/${params}`:
          return (<></>);
      default:
          if(!localStorage.getItem('accessToken')){
              navigate("/login");
          }
          return(<Nav/>);
  }
};

function App() {
  return (
    <BrowserRouter>
        <UseNav />
      <Routes>
        <Route path={'/'} element={<HomePage/>} />
        <Route path={'/settings'} element={<SettingsPage/>} />
        <Route path={'/login'} element={<LoginPage/>}/>
        <Route path={'/register'} element={<RegisterPage/>}/>
        <Route path={'/forgotPassword'} element={<ForgotPasswordPage/>}/>
        <Route path={"/post/:id"} element={<PostExtdWrapper/>} />
        <Route path={"/createpost"} element={<CreatePost quotedPostId={-1}/>} />d
        <Route path={"/createpost/:quotedPostId"} element={<CreatePostWrapper/>} />
        <Route path={"/editpost/:id"} element={<EditPostWrapper/>} />
        <Route path={"/user/:userId"} element={<UserPage/>} />
        <Route path={"/reportpost/:postId"} element={<CreateReportWrapper/>} />
        <Route path={'/messages'} element={<MessagesPage/>} />
        <Route path={'/reports'} element={<ReportsPage/>} />
        <Route path={'/search'} element={<SearchPage/>} />
          <Route path={'/resetPassword/:token'} element={<ResetPage/>} />
          <Route path="google-oauth-success-redirect">
              <Route path=":accessToken" element={<GoogleOAuthSuccessRedirect />} />
          </Route>
      </Routes>
    </BrowserRouter>
  );
}

const PostExtdWrapper = () => {
  const { id } = useParams<{ id?: string }>();

  if (!id) {
    return <div>No post ID provided</div>;
  }

  return <PostExtd postId={Number(id)} />;
};

const EditPostWrapper = () => {
  const { id } = useParams<{ id?: string }>();

  if (!id) {
    return <div>No post ID provided</div>;
  }

  // Fetch the necessary data for editing the post (you can use an API call)
  const initialPostText = "Initial post text here";
  const initialBlockedList = "Initial blocked list here";

  return <EditPost initialPostText={initialPostText} initialBlockedList={initialBlockedList} postId={Number(id)}/>;
};

const CreateReportWrapper = () => {
  const { postId } = useParams<{ postId?: string }>();

  if (!postId) {
    return <div>No post ID provided</div>;
  }

  return <CreateReport postId={Number(postId)}/>;
};

const CreatePostWrapper = () => {
  const { quotedPostId } = useParams<{ quotedPostId?: string }>();

  if (!quotedPostId) {
    return <div>No quoted post ID provided</div>;
  }

  return <CreatePost quotedPostId={Number(quotedPostId)}/>;
};
export default App;
