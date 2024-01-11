import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

const ForgotPassword = () =>{
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleSubmit = async () => {

        try {
            const response = await axios.post('http://localhost:3333/auth/forgotPass', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            navigate('/login');

        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };
    return(
        <div className="sign-in__wrapper">
            <Form className="shadow p-4 bg-white rounded" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="h4 mb-2 text-center">Forgot password</div>
                <Form.Group className="mb-3" controlId="forgotPassword.EmailInput" >
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" name="email" onChange={handleInputChange} placeholder="name@example.com"/>
                    <Form.Text>Enter email for the user you want to get the password for</Form.Text>
                </Form.Group>
                <Button type="submit" className="btn btn-primary w-100">
                    Send password
                </Button>
            </Form>
        </div>
    );
}
export default ForgotPassword;