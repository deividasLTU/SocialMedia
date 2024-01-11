import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import React, {useEffect, useState} from "react";
import Image from 'react-bootstrap/Image';
import photo from '../tempPhotos/placeHolderProfile.jpg';
import UploadImage from '../components/ImageUpload';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
interface ImageState {
    preview: string;
    raw: Blob | string;
}

function getImage(image: Blob | string){
    const formData = new FormData();
    formData.append("file", image);
    return formData
}

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        gender: 'Male',
        profileImage: 'placeHolderProfile.jpg'
      });

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };
    
      const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };

    const [image, setImage] =  useState<ImageState>({ preview: '', raw: '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length) {
            const selectedFile = e.target.files[0];
            setImage({
                preview: URL.createObjectURL(selectedFile),
                raw: selectedFile,
            });
            console.log(image.raw);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form Data:', formData);
      
        try {
          const response = await axios.post('http://localhost:3333/auth/signup', formData, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('Response from server:', response.data);
          const img = getImage(image.raw);
          const email=formData.email
            if(image.raw) {
                const upload = await axios.post('http://localhost:3333/auth/upload/' + email, img, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }
          navigate('/login');
      
        } catch (error) {
          console.error('Error submitting form:', error);
        }
      };

    return (
        <div className="sign-in__wrapper">
            <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
                <div className="h4 mb-2 text-center">Register</div>
                <p>Profile image</p>
                <label htmlFor="upload-button">
                    {image.preview ? (
                        <Image src={image.preview} roundedCircle alt="dummy" width="100px" height="100px" />
                    ) : (
                        <>
                            <Image src={photo} roundedCircle alt="dummy" width="100px" height="100px" />
                        </>
                    )}
                </label>
                <input
                    type="file"
                    id="upload-button"
                    style={{ display: "none" }}
                    onChange={handleChange}
                />
                <Form.Group className="mb-3" controlId="registerForm.UserNameInput">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="username" name="username" onChange={handleInputChange}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="registerForm.EmailInput">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" name="email" placeholder="name@example.com" onChange={handleInputChange}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="registerForm.PasswordInput">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        aria-describedby="passwordHelpBlock"
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="registerForm.GenderInput">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select name="gender" value={formData.gender} onChange={handleSelectChange}>
                        <option>Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </Form.Select>
                </Form.Group>
                <Button type="submit" className="btn btn-primary w-100">
                    Register
                </Button>
                <hr className="my-4" />
                <p className='text-center'>Have an account? <a href="/login" className="link-info">Try login in</a></p>
            </Form>
        </div>
    );
}
export default Register;