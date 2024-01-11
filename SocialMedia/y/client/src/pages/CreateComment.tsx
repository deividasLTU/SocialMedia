// CommentForm.js
import React, { useEffect, FormEvent, useState } from "react";
import { Form, Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GetMention from '../../src/components/Mention'

interface UserData {
    id: number;
    username: string;
    email: string;
    gender: string;
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

const CreateComment: React.FC<{ postId: number }> = ({ postId }) => {
    //const navigate = useNavigate();
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
        username: user != null ? user.username : '',
        text: '',
        likes: 0,
        wasEdited: false,
        userId: user != null ? user.id : '',
        postId: postId
    });

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // code for matching
        /*var pattern = /\B@[a-z0-9_-]+/gi;
        if (formData.text != null) {
            var matches = formData.text.match(pattern);
            matches?.forEach(async (match) => {
                //const newText = match.replace('@', '')
                //console.log("looking for:", newText);
                var username = await GetMention(match.replace('@', ''));
                console.log("username found:", username);
                if (typeof (username) == "string") {
                    //console.log("radom");
                    formData.text.replace(match, `<a href="https://www.w3schools.com">${match}</a>`);
                    //<div dangerouslySetInnerHTML={{ __html: match }} />;
                }
            });
        }*/
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Form Data:', formData);
        try {
            const userData = await getUser();
            const response = await axios.post('http://localhost:3333/comments/create', {
                ...formData,
                userId: userData.id,
                username: userData.username,
                postId: postId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Response from server:', response.data);
            //navigate('/');
            window.location.reload()
        } catch (error) {
            console.error('Error submitting post:', error);
        }
    };

    return (
        <Container className="mt-3">
            <h4>Create Comment</h4>
            <Form.Group className="mb-3" controlId="messageForm.ControlTextarea1">
                <Form.Control as="textarea" name="text" rows={3} placeholder="Comment text" onChange={handleTextChange} />
            </Form.Group>
            <Button className="btn btn-outline-light btn-lg px-2" type="submit" onClick={handleSubmit}>Post Comment</Button>
        </Container>
    );
};

export default CreateComment;
