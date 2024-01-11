import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';


type Props = {}

const GoogleOAuthSuccessRedirect = (props: Props) => {

    let { accessToken} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (accessToken) {
            localStorage.setItem('accessToken', accessToken)
            navigate('/');
        }
    }, [accessToken, navigate])


    return (
        <div>Loading...</div>
    )
}

export default GoogleOAuthSuccessRedirect