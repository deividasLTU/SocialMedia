import Container from 'react-bootstrap/Container';
import { BrowserRouter as Router, Route, Link, useNavigate, useLocation } from "react-router-dom";
import Post from '../components/Post';
import { PostProps } from '../components/Post';
import PostExtd from "./PostExtd";
import React, {JSX, useEffect, useState} from 'react';
import Nav from "../components/Nav";
import axios from 'axios';
import GetMention from "../components/Mention";

interface PostData {
    id: number;
    userId: number;
    text: string;
    likes: number;
    username: string;
    profileImage: string;
    quotedPostId: number;
  }

const Search = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [nav, setNav] = useState<JSX.Element | undefined>(undefined);
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('query');
        
    type PostWithContent = PostData & { content: string };
  
    useEffect(() => {
      const accessToken = localStorage.getItem('accessToken');
    
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
          const searcherId = response.data.id;
    
          axios.get(`http://localhost:3333/posts/all?searcherId=${searcherId}`)
            .then(response => {
              const posts = response.data.map((post: PostData) => ({
                key: post.id,
                id: post.id,
                to: `/post/${post.id}`,
                username: post.username,
                content: post.text,
                likes: post.likes,
                userId: post.userId,
                  quotedPostId: post.quotedPostId,
              }));
    
              // Filter the posts based on the search query
                const filteredPosts = posts.filter((post: PostWithContent) => {
                    const contentMatch = post.content.includes(searchQuery || '');
                    const usernameMatch = post.username.includes(searchQuery || '');

                    return contentMatch || usernameMatch;
                });
              setPosts(filteredPosts);
            })
            .catch(error => {
              console.error(error);
            });
        })
        .catch(error => {
          console.error(error);
        });
      }
    }, [navigate, searchQuery]);
    const userImage = async (userId: number) => {
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
      }, [posts]);

    return( 
      <>
        {nav}
        <Container>
        {[...posts].reverse().map((post, index) => {
            var pattern = /\B@[a-z0-9_-]+/gi;
            var matches = post.content.match(pattern);
            if (matches) {
                for (const match of matches) {
                    GetMention(match.replace('@', '')).then(async userData => {
                        //console.log("username found:", userData);
                        if (userData != null) {
                            // Replace the mention with a link
                            //console.log("Matching..", userData);
                            post.content = post.content.replace(match, `<a href="http://localhost:3000/user/${userData.id}">${match}</a>`);
                        }
                    })}
            }
            const reversedImages = [...images].reverse();
            return (
                images[index] && <PostLink
                key={post.id}
                to={`/post/${post.id}`}
                username={post.username}
                content={post.content}
                likes={post.likes}
                profileImage={reversedImages[index]}
                userId={post.userId}
                quotedPostId={post.quotedPostId}
                />
            );
        })}
        </Container>
      </>
    );
}


interface PostLinkProps {
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
    return (
        <Link to={to} style={{ textDecoration: 'none', color: 'inherit'}}>
            <Post to={to} id={key} username={username} content={content} likes={likes} profileImage={profileImage} userId={userId} quotedPostId={quotedPostId}/>
        </Link>
    );
}
export default Search;