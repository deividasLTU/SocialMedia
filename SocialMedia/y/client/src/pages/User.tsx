import Container from 'react-bootstrap/Container';
import {BrowserRouter as Router, Route, Link, useNavigate, useParams} from "react-router-dom";
import Post from '../components/Post';
import { PostProps } from '../components/Post';
import PostExtd from "./PostExtd";
import React, {JSX, useEffect, useState} from 'react';
import Nav from "../components/Nav";
import axios from 'axios';
import Image from "react-bootstrap/Image";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {Button} from "react-bootstrap";
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
interface UserData {
    id: number;
    username: string;
    email: string;
    gender: string;
    // Add other properties if needed
}

async function getUser() {
    try {
        const response = await axios.get('http://localhost:3333/users/me',{
            headers: {
                Authorization: "Bearer " + localStorage.getItem('accessToken')
            }});
        return response.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const User = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const { userId} = useParams();
    const userName= axios.get(`http://localhost:3333/users/getName/${userId}`);
    const [user, setUser] = useState<UserData | null>(null);
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [isBlockedByUser, setIsBlockedByUser] = useState<boolean>(false);

    useEffect(() => {
        console.log("User.tsx: userId: ", userId);
        async function checkBlockStatus() {
            try {
                if (userId) {
                    const response = await axios.get(`http://localhost:3333/users/isBlockedByUser/${userId}`, {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem('accessToken')
                        }
                    });
                    setIsBlockedByUser(response.data.isBlocked);
                }
            } catch (error) {
                console.error(error);
            }
        }

        checkBlockStatus();
    }, [userId]);

    if (isBlockedByUser) {
        navigate('/');
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const userData = await getUser();
                setUser(userData);
            } catch (error) {
                // Handle the error or log it
                console.error(error);
            }
        }

        fetchData();
    }, []);
    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3333/posts/user/${userId}`)
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

                    setPosts(posts);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }, [userId]);

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
            if (userId) {
                const imgs = await Promise.all(posts.map(post => userImage(post.userId)));
                setImages(imgs);
            }
        };
        if (userId) {
            fetchImages();
        }
    }, [posts,userId]);
    const [img, setImg] = useState<string | undefined>(undefined);
    const [name,setName]=useState<string | undefined>(undefined);
    useEffect(() => {
        const fetchImages = async () => {
            if(userId) {
                const userName = await axios.get(`http://localhost:3333/users/getName/${userId}`);
                setName(userName.data.username)
                let image = await userImage(Number(userId));
                setImg(image);
            }
        };
        if (userId) {
            fetchImages();
        }
    }, [userId]);

    const Block: React.FC<{userPage: any, userCurrent:any}> = ({userPage, userCurrent}) => {
        const handleBlock = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
              const endpoint = isBlocked ? 'unblock' : 'block';
              const response = await axios.post(`http://localhost:3333/users/${endpoint}/${userPage}`, {}, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: "Bearer " + localStorage.getItem('accessToken'),
                },
              });
              setIsBlocked(!isBlocked);
              window.location.reload();
            } catch (error) {
              console.error('Error submitting form:', error);
            }
          };
          if (userPage == userCurrent) {
            return null; // Don't show the block button for the account owner
          } else {
            return (<Button variant="danger" onClick={handleBlock}>{isBlocked ? 'Unblock' : 'Block'}</Button>);
          }
    }

    const checkBlockStatus = async (userPage: string) => {
        try {
          const response = await axios.get(`http://localhost:3333/users/isBlocked/${userPage}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: "Bearer " + localStorage.getItem('accessToken'),
            },
          });
          setIsBlocked(response.data);
        } catch (error) {
          console.error('Error checking block status:', error);
        }
      };

    // Call the checkBlockStatus function when the component is mounted
    useEffect(() => {
        if (userId) {
          checkBlockStatus(userId);
        }
      }, [userId]);
    return (
        <>
            <Container>
                <Col>
                    <Image src={img} roundedCircle height="150px" width="150px"/>
                    <Row xs={2} md={4}>
                        <h3>{name}</h3>
                        <Followers userPage={userId}/>
                        <Follow userPage={userId} userCurrent={user?.id}/>
                        <Block userPage={userId} userCurrent={user?.id}/>
                    </Row>
                </Col>
                <br/>
                {[...posts].reverse().map((post, index) => {
                    const reversedImages = [...images].reverse();
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
const Followers: React.FC<{userPage: any}> = ({userPage}) => {
    const [count, setCount] = useState<number>();
    useEffect(() => {
        const isFollowing = async (userPage: any) => {
            try {
                console.log(userPage)
                const response = await axios.get(`http://localhost:3333/users/followers/${userPage}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: "Bearer " + localStorage.getItem('accessToken'),
                    },
                });
                setCount(response.data)
            } catch (e) {
                throw e;
            }
        }
        isFollowing(userPage)
    },[]);
    console.log(count);
    return(
        <h4>Followers: {count}</h4>
    )
}
const Follow: React.FC<{userPage: any,userCurrent:any}> = ({userPage, userCurrent}) => {
    const handleFollow = async (e: React.FormEvent) => {
        e.preventDefault();
        //console.log('Form Data:', formData);

        try {
            const response = await axios.post('http://localhost:3333/users/follow', {
                following: userPage
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + localStorage.getItem('accessToken'),
                },
            });
            window.location.reload();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleUnFollow = async (e: React.FormEvent) => {
        e.preventDefault();
        //console.log('Form Data:', formData);

        try {
            const response = await axios.post('http://localhost:3333/users/unFollow', {
                following: userPage
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + localStorage.getItem('accessToken'),
                },
            });
            window.location.reload();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };
    const [user, setUser] = useState<UserData | null>(null);
    useEffect(() => {
    const isFollowing = async (userPage: any) => {
        try {
            console.log(userPage)
            const response = await axios.get(`http://localhost:3333/users/isFollowing/${userPage}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + localStorage.getItem('accessToken'),
                },
            });
            setUser(response.data)
        } catch (e) {
            throw e;
        }
    }
    isFollowing(userPage)
    },[]);
    if (userPage == userCurrent) {
        return (<Button hidden onClick={handleFollow}>Follow</Button>);
    } else if (user) {
        return (<Button onClick={handleUnFollow}>Unfollow</Button>);
    } else {
        return (<Button onClick={handleFollow}>Follow</Button>);
    }
}

interface PostLinkProps {
    key: number;
    to: string;
    username: string;
    content: string;
    likes: number;
    profileImage: string;
    userId:number;
    quotedPostId: Number;
}

const PostLink: React.FC<PostLinkProps> = ({ key, to, username, content, likes, profileImage ,userId, quotedPostId}) => {
    var tempKey = parseInt(to.replace(/^\D+/g, ''));
    return (
        <Link to={to} style={{ textDecoration: 'none', color: 'inherit'}}>
            <Post to={to} id={tempKey} username={username} content={content} likes={likes} profileImage={profileImage} userId={userId} quotedPostId={quotedPostId}/>
        </Link>
    );
}
export default User;