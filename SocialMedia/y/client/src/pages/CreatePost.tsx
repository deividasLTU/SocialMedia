import React, { useEffect, useState } from "react";
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface UserData {
    id: number;
    username: string;
    email: string;
    gender: string;
}
interface CreatePostProps {
    quotedPostId: number;
}
async function getUser(): Promise<UserData> {
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

const CreatePost: React.FC<CreatePostProps> = ({ quotedPostId }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const userData = await getUser();
                setUser(userData);
            } catch (error) {
                console.error(error);
            }
        }

        fetchUserData();
    }, []);


    const [formData, setFormData] = useState({
        text: '',
        theme: '',
        WasEdited: false,
        userId: user,
    });

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form Data:', formData);

        try {
            const userData = await getUser();
            const response = await axios.post('http://localhost:3333/posts/post', {
                ...formData,
                userId: userData.id,
                quotedPostId: quotedPostId,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Response from server:', response.data);
            navigate('/');
        } catch (error) {
            console.error('Error submitting post:', error);
        }
    };
    if (quotedPostId === -1) {
        return (
            <Container className="mt-3">
                <h2>Create Post</h2>

                {/* Textbox for the post */}
                <Form.Group controlId="postText">
                    <Form.Label>Post:</Form.Label>
                    <Form.Control as="textarea" name="text" rows={3} placeholder="Enter your post here" onChange={handleTextChange} />
                </Form.Group>

                <Button variant="success" className="float-right" style={{ height: '35px' }} onClick={handlePostSubmit}>
                    Post
                </Button>
            </Container>
        );
    }
    else {
        return (
            <Container className="mt-3">
                <h2>Create Post with quote</h2>

                {/* Textbox for the post */}
                <Form.Group controlId="postText">
                    <Form.Label>Post:</Form.Label>
                    <Form.Control as="textarea" name="text" rows={3} placeholder="Enter your post here" onChange={handleTextChange} />
                </Form.Group>

                <Button variant="success" className="float-right" style={{ height: '35px' }} onClick={handlePostSubmit}>
                    Post
                </Button>
            </Container>
        );
    }
}

export default CreatePost;