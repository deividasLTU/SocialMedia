import Container from 'react-bootstrap/Container';
import Button from  'react-bootstrap/Button'
import Form from 'react-bootstrap/Form';
import Icon from 'react-bootstrap/Image';
import "./login.css";
import Image from "react-bootstrap/Image";
import GoogleIcon from '../svg/google.svg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
  
    try {
      const response = await axios.post('http://localhost:3333/auth/signin', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { access_token } = response.data

      localStorage.setItem('accessToken', access_token)
      console.log('Login successful')
      navigate('/');
  
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

    const googleLogin = async () => {
        try {
            window.open('http://localhost:3333/auth/google','_self');
        } catch (ex) {
            console.log(ex)
        }
    }

    return (
        <div className="sign-in__wrapper">
          <Form className="shadow p-4 bg-white rounded" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="h4 mb-2 text-center">Sign In</div>
              <Form.Group className="mb-3" controlId="loginForm.EmailInput">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" name="email" placeholder="name@example.com" onChange={handleInputChange}/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="loginForm.PasswordInput">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    aria-describedby="passwordHelpBlock"
                    onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-2" controlId="checkbox">
                <Form.Check type="checkbox" label="Remember me" />
              </Form.Group>
              <Button type="submit" className="btn btn-primary w-100">
                Log in
              </Button>
            <div className="d-grid justify-content-end">
              <Button className="text-muted px-0" variant="link" href="/forgotPassword">Forgot password?</Button>
            </div>
              <p className='text-center'>or sign up with:</p>
              <Button className='btn-light' onClick={googleLogin}>
                  <Image src={GoogleIcon} className="sm"/>
              </Button>

              <hr className="my-4" />
            <p className='text-center'>Don't have an account? <a href="/register" className="link-info">Register here</a></p>

          </Form>
        </div>
    );
}
export default Login;