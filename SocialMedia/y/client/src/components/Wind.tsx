import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import React, { useState } from 'react';
import Alerts from '../components/Alerts'
import {useNavigate} from "react-router-dom";
import axios from "axios";

const whichSettingOption = (name:string) =>{
    switch(name){
        case "name":{
            return "Profile name";
        }
        case "password":{
            return "Password";
        }
        case "gender":{
            return "Gender";
        }
        case "picture":{
            return "Profile picture";
        }
        case "delete":{
            return "Profile deletion";
        }
        default:{
            return "";
        }
    }
}



const Wind:React.FC<{name: string,formData:any,disabled:boolean|undefined}> =({name, formData,disabled}) =>{
    const [show,setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const navigate = useNavigate();


    switch (name){
        case "delete":
            const handleDeleteSubmit = async (e: React.FormEvent) => {
                const email = formData;
                try {
                    const response = await axios.delete('http://localhost:3333/users/delete', {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        data:{email}
                    });
                    handleClose();
                    localStorage.removeItem('accessToken');
                    navigate('/login');

                } catch (error) {
                    console.error('Error submitting form:', error);
                }
            };
            return(
                <>
                    <Button variant="danger" onClick={handleShow} disabled={disabled}>Delete</Button>
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>{whichSettingOption(name)}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Do you really want to delete your profile?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                No
                            </Button>
                            <Button variant="danger" onClick={handleDeleteSubmit}>
                                Yes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            );
        case "block":
            return(
                <>
                    <Button variant="primary" onClick={handleShow}>Block</Button>
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>{whichSettingOption(name)}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Do you really want to block this user?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                No
                            </Button>
                            <Button variant="primary" onClick={handleClose} href="/">
                                Yes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            );
        default:
            const handleUpdateSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                //console.log('Form Data:', formData);

                try {
                    if(name == "picture"){
                        const response = await axios.post('http://localhost:3333/users/upload', formData,{
                            headers: {
                                Authorization: "Bearer " + localStorage.getItem('accessToken')
                            }
                        });
                        handleClose();
                        navigate('/settings');
                        window.location.reload();
                    }else if(name=="password"){
                        const response = await axios.post('http://localhost:3333/users/updatePassword', formData,{
                            headers: {
                                Authorization: "Bearer " + localStorage.getItem('accessToken')
                            }
                        });
                        handleClose();
                        localStorage.removeItem('accessToken');
                        navigate('/login');
                    }
                    else{
                        const response = await axios.post('http://localhost:3333/users/update', formData, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        handleClose();
                        navigate('/settings');
                        window.location.reload();
                    }
                    //console.log('Response from server:', response.data);


                } catch (error) {
                    console.error('Error submitting form:', error);
                }
            };
            return(
                <>
                    <Button variant="primary" onClick={handleShow} disabled={disabled}>Change</Button>
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>{whichSettingOption(name)}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Do you really want to change your profile {name}?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button onClick={handleUpdateSubmit} variant="primary">
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            );
    }
}
export default Wind;