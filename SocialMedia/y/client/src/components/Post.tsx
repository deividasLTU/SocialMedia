import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from 'react-router-dom';
import GetMention from "../components/Mention";

export interface PostProps {
  to: string;
  id: number;
  username: string;
  content: string;
  likes: number;
  profileImage: string;
  userId: number;
  quotedPostId: Number;
}
interface UserData {
  id: number;
  username: string;
  email: string;
  gender: string;
}
interface QuotedPost {
  id: number;
  username: string;
  content: string;
  likes: number;
  profileImage: string;
  userId: number;
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

const Post: React.FC<PostProps> = ({ to, id, username, content, likes, profileImage, userId, quotedPostId }) => {
  //var userData: UserData;
  const [hasLike, setLikeStatus] = useState('');
  const [quotedPostData, setQuotedPostData] = useState({
    id: 0,
    username: "",
    content: "",
    likes: 0,
    profileImage: "",
    userId: 0,
  });
  var buttonText = "";
  // check if user has liked a comment
  useEffect(() => {
    if (quotedPostId !== null && quotedPostId !== 0) {
      console.log("Quote query: ", quotedPostId);
      axios.get(`http://localhost:3333/posts/${quotedPostId}`)
        .then(async response => {
            // code for matching
            var pattern = /\B@[a-z0-9_-]+/gi;
            var matches = response.data.text.match(pattern);
            if (matches) {
              for (const match of matches) {
                var userData = await GetMention(match.replace('@', ''));
                //console.log("username found:", userData);
                if (userData != null) {
                  // Replace the mention with a link
                  response.data.text = response.data.text.replace(match, `<a href="http://localhost:3000/user/${userData.id}">${match}</a>`);
                }
              }
            }
          // end of code for matching
          return setQuotedPostData({
            id: response.data.id,
            username: response.data.user.username,
            content: response.data.text,
            likes: response.data.likes,
            profileImage: response.data.user.profileImage,
            userId: response.data.user.id,
          });
        }).catch(error => {
          console.error(error);
        });
    }
  }, [quotedPostId]);
  useEffect(() => {
    const checkForReaction = async () => {
      try {
        //console.log("AAA: ", to, id, username, content, likes, profileImage);
        const userData = await getUser();
        const response = await axios.get(`http://localhost:3333/reactions/check`, {
          params: {
            userId: userData.id,
            commentId: -1,
            postId: id,
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
  }, [id]);
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
        commentId: -1,
        postId: id,
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
  const userLink = `/user/${userId}`
  const quotedUserLink = `/user/${quotedPostData.userId}`
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to={userLink}>
            <img src={profileImage} height="30px" width="30px" alt={username} style={{ marginRight: '10px' }} />
          </Link>
          <h5 className="card-title">{username}</h5>
        </div>
        <p className="card-text" dangerouslySetInnerHTML={{ __html: content }} />
        {quotedPostId !== null && (
          // include content of quoted post here
          <>
            <div className="card mb-3">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Link to={quotedUserLink}>
                    <img src={quotedPostData.profileImage} height="30px" width="30px" alt={quotedPostData.username} style={{ marginRight: '10px' }} />
                  </Link>
                  <h5 className="card-title">{quotedPostData.username}</h5>
                </div>
                <p className="card-text" dangerouslySetInnerHTML={{ __html: quotedPostData.content }} />
              </div>
              <div className="card-footer text-muted d-flex justify-content-between">
                <span className="mr-3">{quotedPostData.likes} Likes</span>
              </div>
            </div></>
        )}
      </div>
      <div className="card-footer text-muted d-flex justify-content-between">
        <span className="mr-3">{likes} Likes</span>
        <Button className="btn btn-info" type="submit" onClick={handleSubmit}>{buttonText}</Button>
      </div>
    </div>
  );
}
export default Post;