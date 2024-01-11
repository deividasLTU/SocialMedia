import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import Wind from '../components/Wind';
import Image from 'react-bootstrap/Image';
import photo from '../tempPhotos/placeHolderProfile.jpg';
import Button from "react-bootstrap/Button";
import Stack from 'react-bootstrap/Stack';
import UploadImage from '../components/ImageUpload';
import React, {useEffect, useState,ChangeEvent} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

interface UserData {
    id: number;
    username: string;
    email: string;
    gender: string;
    // Add other properties if needed
}
interface ImageState {
    preview: string;
    raw: Blob | string;
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
function getImage(image: Blob | string){
    const formData = new FormData();
    formData.append("file", image);
    return formData
}
function Settings() {
    const [user, setUser] = useState<UserData | null>(null);

    const [img, setImg] = useState<string | undefined>(undefined);
    const [pass,setPass]=useState({
        password: ""
    });
    const userImage = async () =>{
        try {
                const response = await axios.get('http://localhost:3333/users/profile-image/', {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('accessToken')
                    }
                });
                setImg(response.data);
        }catch (e) {
            throw e;
        }
    }

    useEffect(() => {
        userImage();
    }, []);

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

    const [disable, setDisable] = useState<boolean | undefined>(undefined);
    const googleAcc = async () =>{
        try {
            const answer = await axios.get('http://localhost:3333/users/logedInWithGoogle/', {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('accessToken')
                },
            });
            if(answer.data){
                setDisable(true);
            }else{
                setDisable(false);
            }
        }
        catch (e) {
            throw e;
        }
    }
    useEffect(() => {
        googleAcc();
    }, []);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...(prevUser as UserData),
            [name]: value,
        }));
    };
    const handlePassInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPass({
            ...pass,
            password: value
        });
    };
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...(prevUser as UserData),
            [name]: value,
        }));
    };
    const [image, setImage] =  useState<ImageState>({ preview: '', raw: '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length) {
            const selectedFile = e.target.files[0];
            setImage({
                preview: URL.createObjectURL(selectedFile),
                raw: selectedFile,
            });
        }
    };

    return (
        <div className='container'>
            <h2>Account</h2>
            <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey='1'>
                    <Accordion.Header>
                        <h5>Profile picture</h5>
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>Change profile picture</p>
                        <Stack direction='horizontal' gap={3}>
                            <Form.Group className="mb-3" controlId="registerForm.UserImageInput">
                            </Form.Group>
                            <label htmlFor="upload-button">
                                {image.preview ? (
                                    <Image src={image.preview} roundedCircle alt="dummy" width="100px" height="100px" />
                                ) : (
                                    <>
                                        <Image src={img} roundedCircle alt="dummy" width="100px" height="100px" />
                                    </>
                                )}
                            </label>
                            <input
                                type="file"
                                id="upload-button"
                                style={{ display: "none" }}
                                onChange={handleChange}
                                disabled={disable}
                            />
                            <Wind name='picture' formData={getImage(image.raw)} disabled={disable} ></Wind>
                        </Stack>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='2'>
                    <Accordion.Header>
                        <h5>Profile name</h5>
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>Change profile name</p>
                        <Stack direction='horizontal' gap={3}>
                            <Form.Control name="username" placeholder={user?.username} onChange={handleInputChange} disabled={disable}/>
                            <Wind name='name' formData={user} disabled={disable}></Wind>
                        </Stack>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='3'>
                    <Accordion.Header>
                        <h5>Password</h5>
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>Change profile password</p>
                        <Stack direction='horizontal' gap={3}>
                            <Form.Control name="password" type='password' placeholder='Password' id='inputPassword5' onChange={handlePassInputChange} disabled={disable}/>
                            <Wind name='password' formData={pass} disabled={disable}></Wind>
                        </Stack>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='4'>
                    <Accordion.Header>
                        <h5>Gender</h5>
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>Change profile gender</p>
                        <Stack direction='horizontal' gap={3}>
                            <Form.Select name="gender" value={user?.gender} onChange={handleSelectChange} disabled={disable}>
                                <option>Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                            <Wind name='gender' formData={user} disabled={disable}></Wind>
                        </Stack>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='5'>
                    <Accordion.Header>
                        <h5>Profile Deletion</h5>
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>Delete your profile</p>
                        <Stack direction='horizontal' gap={3}>
                            <Wind name='delete' formData={user?.email} disabled={false}></Wind>
                        </Stack>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey='6'>
                    <Accordion.Header>
                        <h5>Blocked users</h5>
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>Blocked users will not be able to see your posts</p>
                        <Stack direction='horizontal' gap={3}>
                            <Form.Control type='block' placeholder='@username' id='blockUser' />
                            <Wind name='block' formData={user} disabled={false}></Wind>
                        </Stack>
                        <p/>
                        <p>Blocked users list:</p>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {Array.from({ length: 9 }, (_, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <Image
                                src={`https://via.placeholder.com/64`}
                                alt={`Profile pic ${index + 1}`}
                                width={64}
                                height={64}
                                className="mr-3"
                                roundedCircle
                            />
                            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
                                {`User${index + 1}`}
                                <Button variant="outline-primary" size="sm" style={{ marginLeft: '10px' }}>
                                    Unblock
                                </Button>
                            </div>
                            </div>
                        ))}
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}
export default Settings;