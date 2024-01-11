import Container from 'react-bootstrap/Container';
import { BrowserRouter as Router, Route, Link, useNavigate } from "react-router-dom";
import Post from '../components/Post';
import { PostProps } from '../components/Post';
import PostExtd from "./PostExtd";
import React, {JSX, useEffect, useState} from 'react';
import Nav from "../components/Nav";
import axios from 'axios';
import GetMention from "../components/Mention";
import Report from '../components/Report'; // Import your Report component

interface ReportData {
    id: number;
    text: string;
    userId: number;
    postId: number;
  }

  async function getUser() { 
    try {
        const response = await axios.get('http://localhost:3333/users/me',{
            headers: {
            Authorization: "Bearer " + localStorage.getItem('accessToken')
        }});
        return response.data.role;
    } catch (e) {
        console.error(e);
        throw e;
    }
}


const Reports = () => {
    const navigate = useNavigate();
    const [reportData, setReportData] = useState([]);
    //const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const userRole = await getUser();
  
          if (userRole === 0) {
            navigate('/');
          }
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchData();
    }, []);
  
    useEffect(() => {
    /*  const accessToken = localStorage.getItem('accessToken');
    
      if (!accessToken) {
        navigate('/login');
      } else {
        setNav(<Nav/>);
    
        // Make a request to the getMe endpoint to get the userId
        axios.get('http://localhost:3333/users/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        .then(response => {
          const searcherId = response.data.id;*/
    
          axios.get(`http://localhost:3333/reports/all`)
            .then(response => {
                console.log("Report response: ", response.data);
              const reports = response.data.map((report: ReportData) => ({
                key: report.id,
                id: report.id,
                text: report.text,
                userId: report.userId,
                postId: report.postId,
              }));
              setReportData(reports);
            })
            .catch(error => {
              console.error(error);
            });
            
            console.log("Report data: ", reportData);
            console.log("type: ", typeof(reportData));
        }, [navigate]);



      /*const userImage = async (userId: number) => {
        try {
            const response = await axios.get(`http://localhost:3333/users/${userId}/profile-image/`, {
              headers: {
                Authorization: "Bearer " + localStorage.getItem('accessToken')
              },
            });
              return response.data;
        } catch (error) {
          console.error(error);
        }
      };

      useEffect(() => {
        const fetchImages = async () => {
          const imgs = await Promise.all(posts.map(post => userImage(post.userId)));
          setImages(imgs);
        };
      
        fetchImages();
      }, [posts]);*/
      return (
        <div>
          <h1>Reports</h1>
          {reportData.map((report, index) => (
            <Report key={index} report={report} />
          ))}
        </div>
      );
}


/*interface PostLinkProps {
    key: number;
    to: string;
    username: string;
    content: string;
    likes: number;
    profileImage: string;
    userId:number;
    quotedPostId:Number;
}

const PostLink: React.FC<PostLinkProps> = ({ key, to, username, content, likes, profileImage ,userId, quotedPostId}) => {
    //console.log("Post Link:", parseInt(to.replace(/^\D+/g, '')));
    // for some reason "key" is undefined, so as temporary solution it is extracted from "to" string
    // this is also shown as error in browser console
    // current fix is a very ghetto solution, should be changed later
    var tempKey = parseInt(to.replace(/^\D+/g, ''));
    //console.log("POST DATA:", quotedPostId)
    return (
        <Link to={to} style={{ textDecoration: 'none', color: 'inherit'}}>
            <Post to={to} id={tempKey} username={username} content={content} likes={likes} profileImage={profileImage} userId={userId} quotedPostId={quotedPostId}/>
        </Link>
    );
}*/
export default Reports;