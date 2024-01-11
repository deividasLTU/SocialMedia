import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';

interface Comment {
  id: number;
  userId: number; // Assuming you have userId in your Comment interface
  postId: number;
  text: string;
  likes: number;
}
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
    console.log("Type of userId:", typeof (response.data.id));
    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
const Comment: React.FC<Comment> = ({ id, userId, postId, text, likes }) => {
  const [username, setUsername] = useState('');
  const [hasLike, setLikeStatus] = useState('');
  var buttonText = "";
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        console.log("Fetching with userId:", userId);
        const response = await axios.get(`http://localhost:3333/comments/user/${userId}`);
        setUsername(response.data.username);
        //setCommentId(response.data.id);
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUsername();
  }, [userId]); // The dependency array ensures that useEffect runs when userId changes

  // check if user has liked a comment
  useEffect(() => {
    const checkForReaction = async () => {
      try {
        //console.log("Fetching with userId:", userId);
        const userData = await getUser();
        const response = await axios.get(`http://localhost:3333/reactions/check`, {
          params: {
            userId: userData.id,
            commentId: id,
            postId: -1,
          }, 
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        setLikeStatus(response.data);
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    checkForReaction();
  }, [userId]); // The dependency array ensures that useEffect runs when userId changes
  //console.log("hasLike:", hasLike)
  if (hasLike == "") {
    buttonText = "Like";
  }
  else {
    buttonText = "Remove like";
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userData = await getUser();
      var url = 'http://localhost:3333/reactions/add';
      if (hasLike != "") {
        url = 'http://localhost:3333/reactions/remove';
      }
      const response = await axios.post(url, {
        userId: userData.id,
        commentId: id,
        postId: -1,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response from server:', response.data);
      window.location.reload();
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };
  return (
    <div className="card" style={{ width: 600 }}>
      <div className="card-body">
        <h5 className="card-title"><strong>{username}</strong> </h5>
        <p className="card-text" dangerouslySetInnerHTML={{ __html: text }} />
      </div>
      <div className="card-footer text-muted d-flex justify-content-between">
        <span className="mr-3">{likes} Likes</span>
        <Button className="btn btn-info" type="submit" onClick={handleSubmit}>{buttonText}</Button>
      </div>
    </div>
  );
}
export default Comment;