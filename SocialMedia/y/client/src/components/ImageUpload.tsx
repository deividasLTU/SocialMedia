import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import photo from "../tempPhotos/placeHolderProfile.jpg";
import Register from "../pages/Register";
import axios from "axios";
import {Simulate} from "react-dom/test-utils";
import input = Simulate.input;
import {useNavigate} from "react-router-dom";

const UploadImage:React.FC<{id:number|undefined}> =({id}) => {
    const [inputFile, setInputFile] = useState<HTMLInputElement | null>(null);
    useEffect(() => {
        setInputFile(document.getElementById("input-file") as HTMLInputElement);
    }, []);

    const navigate = useNavigate();
    const handleUpload = async () => {
        inputFile?.click();
        try {
            const response = await axios.delete('http://localhost:3333/users/upload', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + localStorage.getItem('accessToken')
                },
                data: {inputFile}
            });
            navigate('/settings');

        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };
    return(
        <Form.Group className="mb-3" controlId="registerForm.UserImageInput">
            <input id="input-file" className="d-none" type="file" />
            <Image src={photo} roundedCircle height="100px" onClick={handleUpload}/>
        </Form.Group>
    );
}
export default UploadImage;