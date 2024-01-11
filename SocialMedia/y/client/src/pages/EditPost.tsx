import React from "react";
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { get } from "http";

interface EditPostProps {
    initialPostText: string;
    initialBlockedList: string;
    postId: number;
}

interface UserData {
    username: string;
    profileImage: string;
    userId: number;
}

const EditPost: React.FC<EditPostProps> = ({ postId }) => {
    const [postText, setPostText] = useState('');
    const [creatorId, setCreatorId] = useState(0);
    const navigate = useNavigate();


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

    useEffect(() => {
        axios.get(`http://localhost:3333/posts/${postId}`)
          .then(response => {
            setPostText(response.data.text);
            setCreatorId(response.data.user.id);
            return getUser();
          })
          .then(currentUser => {
            setCreatorId(creatorId => {
              if (currentUser.id !== creatorId) {
                navigate(`/post/${postId}`);
              }
              return creatorId;
            });
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }, [postId, navigate]);

    const handleSave = () => {
        axios.put(`http://localhost:3333/posts/${postId}`, {
          text: postText,
          theme: "",
          WasEdited: true
        })
        .then(() => {
            console.log('Post updated successfully');
            navigate(`/post/${postId}`);
        })
        .catch(error => {
            console.error('Error updating post:', error);
        });
    };
  
    return (
      <Container className="mt-3">
        <h2>Edit Post</h2>
  
        <Form.Group controlId="postText">
          <Form.Label>Post:</Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="Enter your post here" value={postText} onChange={e => setPostText(e.target.value)} />
            </Form.Group>

            <Button variant="success" className="float-right" style={{height: '35px'}} onClick={handleSave}>
                Post
            </Button>
        </Container>
    );
}

export default EditPost;
