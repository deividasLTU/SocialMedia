import React, { useState, useEffect } from "react";
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import { useParams, useNavigate } from "react-router-dom";
import Post, { PostProps } from "../components/Post";
import CommentList from '../components/CommentList';
import CommentForm from '../pages/CreateComment';
import axios from "axios";
import { userInfo } from "os";
import GetMention from "../components/Mention";
import { Button } from "react-bootstrap";

interface PostExtdProps {
    postId: number;
}

interface Comment {
    username: string
    text: string
    likes: number
    id: number
    postId: number
    userId: number
}

interface UserData {
    id: number;
    username: string;
    email: string;
    gender: string;
}

async function getUser() {
    try {
        const response = await axios.get('http://localhost:3333/users/me', {
            headers: {
                Authorization: "Bearer " + localStorage.getItem('accessToken')
            }
        });
        return response.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const PostExtd: React.FC<PostExtdProps> = ({ postId }) => {
    const { id } = useParams();
    const [postData, setPostData] = useState({
        username: "",
        content: "",
        likes: 0,
        profileImage: "",
        userId: 0,
        quotedPostId: 0,
    });

    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const navigate = useNavigate();
    const [isBlockedByUser, setIsBlockedByUser] = useState<boolean>(false);

    useEffect(() => {
        axios.get(`http://localhost:3333/posts/${postId}`)
            .then(async response => {
                // code for matching
                var pattern = /\B@[a-z0-9_-]+/gi;
                var matches = response.data.text.match(pattern);
                if (matches) {
                    for (const match of matches) {
                        var userData = await GetMention(match.replace('@', ''));
                        //console.log("username found:", userData);
                        if (userData != null) {
                            // Replace the mention with a link
                            response.data.text = response.data.text.replace(match, `<a href="http://localhost:3000/user/${userData.id}">${match}</a>`);
                        }
                    }
                };
                // end of code for matching
                setPostData({
                    username: response.data.user.username,
                    content: response.data.text,
                    likes: response.data.likes,
                    profileImage: response.data.user.profileImage,
                    userId: response.data.user.id,
                    quotedPostId: response.data.quotedPostId,
                });
                return postData.username;
            })
            .catch(error => {
                console.error(error);
            });
    }, [postId]);

    
    
    useEffect(() => {
        async function checkBlockStatus() {
            try {
                if (postData?.userId) {
                    const response = await axios.get(`http://localhost:3333/users/isBlockedByUser/${postData?.userId}`, {
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
    }, [postData?.userId]);

    if (isBlockedByUser) {
        navigate('/');
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const userData = await getUser();
                setUser(userData);
            } catch (error) {
                console.error(error);
            }
        }

        fetchData()
    }, []);
    const handleToggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleEditClick = () => {
        navigate(`/editpost/${id}`);
    };

    const handleDeleteClick = () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            deletePostFromDatabase();
        }
    };

    const handleReportClick = () => {
        navigate(`/reportpost/${id}`);
    };

    const handleQuoteClick = () => {
        navigate(`/createpost/${id}`);
    };

    const deletePostFromDatabase = async () => {
        try {
            await axios.delete(`http://localhost:3333/posts/${postId}`)
                .then(() => {
                    navigate(`/`);
                });
            console.log(`Post deleted:', ${postId}`);
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const [comments, setComments] = useState([]);

    // Fetch comments from the backend when the component mounts
    useEffect(() => {
        // Fetch comments from the backend when the component mounts
        const fetchComments = async () => {
            try {
                const postID: number = postId;

                const response = await axios.get(`http://localhost:3333/comments/${postID}`);
                // code for matching
                //var newComments: CommentList;
                var pattern = /\B@[a-z0-9_-]+/gi;
                const updatedComments = response.data.map(async (element: Comment) => {
                    var matches = element.text.match(pattern);
                    if (matches) {
                        for (const match of matches) {
                            var userData = await GetMention(match.replace('@', ''));
                            //console.log("userData found:", userData);
                            if (userData != null) {
                                // Replace the mention with a link
                                element.text = element.text.replace(match, `<a href="http://localhost:3000/user/${userData.id}">${match}</a>`);
                            }
                        }
                    }
                    return element;
                });

                // Wait for all promises to resolve
                await Promise.all(updatedComments);
                //console.log(resolvedComments);
                // end of code for matching
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, []);// Empty dependency array ensures the effect runs once when the component mounts
    return (
        <>
<Container style={{ marginTop: '40px' }}>
  <div style={{ position: 'relative' }}>
    <Post
      to={`/posts/${postId}`}
      id={postId}
      profileImage={postData.profileImage}
      username={postData.username}
      content={postData.content}
      likes={postData.likes}
      userId={postData.userId}
      quotedPostId={postData.quotedPostId}
    />
    <Button className="btn btn-warning" type="submit" style={{ position: 'absolute', top: '-40px', right: 80 }} onClick={handleQuoteClick}>Quote post</Button>
    {user && user.id !== postData.userId && (
    <Button className="btn btn-danger" type="submit" style={{ position: 'absolute', top: '-40px', right: 0 }} onClick={handleReportClick}>Report</Button>)}
    {user && user.id === postData.userId && (
      <Dropdown style={{ position: 'absolute', top: '-40px', right: 0 }} show={showDropdown} onSelect={() => setShowDropdown(false)}>
        <Dropdown.Toggle variant="secondary" id="dropdown-basic" onClick={handleToggleDropdown}>
          Options
        </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handleEditClick}>Edit</Dropdown.Item>
                                <Dropdown.Item onClick={handleDeleteClick}>Delete</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                </div>
                <h3>Comments</h3>
                <CommentList comments={comments} />
                <CommentForm postId={postId} />
            </Container>
        </>
    );
};

export default PostExtd;
