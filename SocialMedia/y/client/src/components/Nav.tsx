import React, {useEffect, useState} from "react";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Navi from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Image from 'react-bootstrap/Image';
import { Button, Form, FormControl } from "react-bootstrap";
import photo from '../tempPhotos/placeHolderProfile.jpg';
import icon from  '../svg/Y.png';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

interface UserData {
    username: string;
    profileImage: string;
    id:number;
    role: number;
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
const Nav: React.FC<{}> = () => {
    const navigate = useNavigate()

    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');

        navigate('/login');
    };
    const [user, setUser] = useState<UserData | null>(null);

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

    const [img, setImg] = useState<string | undefined>(undefined);
    const userImage = async () =>{
        try {
                const response = await axios.get('http://localhost:3333/users/profile-image/', {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('accessToken')
                    },
                });
                setImg(response.data);
        }catch (e) {
            throw e;
        }
    }

    useEffect(() => {
        userImage();
    }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
      };
      
      const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      };

    const userPage= `/user/${user?.id}`;

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container fluid style={{paddingLeft: 10, paddingRight: 10}}>
                <Navbar.Brand href="/"><Image src={icon} alt="Y_logo" height="30px"/>
                </Navbar.Brand>
                <Button variant="primary" href="/createpost">Create post</Button>
                <div className="d-flex align-items-center mx-3">
                <Form className="d-flex" onSubmit={handleSearchSubmit}>
                    <FormControl
                        type="text"
                        placeholder="Search bar"
                        className="mr-2"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Button variant="outline-primary" type="submit">Search</Button>
                    </Form>
                </div>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse className="justify-content-end">
                    <Navi>
                        <Navi.Link href="/">Home</Navi.Link>
                        <Navi.Link href="/messages">Messages</Navi.Link>
                        {user?.role === 1 ? (
                            <Navi.Link href="/reports">Reports</Navi.Link>
                        ) : null}
                        <NavDropdown title={
                            <div className="col">
                                <Image src={img} roundedCircle height="30px" width="30px"/>
                            </div>
                        } id="collapsible-nav-dropdown" align="end">
                            <NavDropdown.Item href={userPage}>{user?.username}</NavDropdown.Item>
                            <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
                            <NavDropdown.Divider/>
                            <NavDropdown.Item onClick={handleLogout}>Log out</NavDropdown.Item>
                        </NavDropdown>
                    </Navi>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
export default Nav;