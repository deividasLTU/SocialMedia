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
interface ReportPostProps {
    postId: number;
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

const CreateReport: React.FC<ReportPostProps> = ({ postId }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        text: '',
      });

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form Data:', formData, postId);
        try {
            const userData = await getUser();
            const response = await axios.post('http://localhost:3333/posts/report', {
                ...formData,
                userId: userData.id,
                postId: postId,
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

    return (
        <Container className="mt-3">
            <h2>Create Report</h2>
            
            {/* Textbox for the post */}
            <Form.Group controlId="postText">
                <Form.Label>Describe the problem:</Form.Label>
                <Form.Control as="textarea" name="text" rows={3} placeholder="Enter text here" onChange={handleTextChange} />
            </Form.Group>
                        {/* Invisible span to cover the button for file input */}
            <Button className="mr-2" style={{height: '35px'}} onClick={handlePostSubmit}>
                Submit
            </Button>
        </Container>
    );
}

export default CreateReport;