import Container from 'react-bootstrap/Container';
import Post from "../components/Post";
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import Stack from 'react-bootstrap/Stack';
import Wind from '../components/Wind';
import { Image } from 'react-bootstrap';
import LikeImage from '../like.jpg';
import Badge from '../components/Badge';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

interface User {
    id: number;
    username: string;
    googleID: string;
}

interface Message {
  id: number
  senderId: number
  receiverId: number
  messageContent: string
  messageImage: string
  isLiked: boolean
}

interface Images {
  [key: string]: string | undefined;
}

async function getUser() {
    try {
        const response = await axios.get('http://localhost:3333/users/me',{
            headers: {
            Authorization: "Bearer " + localStorage.getItem('accessToken')
        }});
        return response.data.id;
    } catch (e) {
        console.error(e);
        throw e;
    }
}


const UserProfile = ({ user, onClick, userImages }: { user: User; onClick: (userId: number) => void; userImages: Record<string, string | undefined> }) => (
  <div style={{ position: 'relative' }}>
    <Image
      src={userImages[user.username] || 'https://via.placeholder.com/64'}
      alt={`Profile pic ${user.id}`}
      width={64}
      height={64}
      className="mr-3"
      onClick={() => onClick(user.id)}
      style={{ cursor: 'pointer' }}
      roundedCircle
    />
  </div>
);



const UserProfileList = ({ users, currentUserID, onProfileClick, userImages }: { users: User[]; currentUserID: number | null; onProfileClick: (userId: number) => void; userImages: Record<string, string | undefined> }) => {
  const filteredUsers = users.filter((user) => user.id !== currentUserID);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {filteredUsers.map((user) => (
        <UserProfile key={user.id} user={user} onClick={onProfileClick} userImages={userImages} />
      ))}
    </div>
  );
};


const ChatInterface = ({ selectedUser, currentUser, users, onCloseChat }: { selectedUser: number; currentUser: number | null; users: User[]; onCloseChat: () => void }) => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [likedMessages, setLikedMessages] = useState<number[]>([]);

  const [fetchMessagesCalledByLike, setFetchMessagesCalledByLike] = useState(false);

  const selectedUserProfile = users.find((user) => user.id === selectedUser);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);


  const handleLikeMessage = async (messageId: number, userId: number | null) => {
    try {
      await axios.post(
        `http://localhost:3333/messages/like/${messageId}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ` + localStorage.getItem('accessToken'),
          },
        }
      );

      setFetchMessagesCalledByLike(true);
      setLikedMessages((prevLikedMessages) => [...prevLikedMessages, messageId]);
      fetchMessages()
      
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {

      const isConfirmed = window.confirm('Are you sure you want to delete this message?');

      if (!isConfirmed) {
        return;
      }

      await axios.delete(`http://localhost:3333/messages/delete/${messageId}`, {
        headers: {
          Authorization: `Bearer ` + localStorage.getItem('accessToken'),
        },
      });
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:3333/messages/sentMessages/${currentUser}/${selectedUser}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentUser, selectedUser]);

  
  useEffect(() => {
    if (messagesContainerRef.current && !fetchMessagesCalledByLike) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    setFetchMessagesCalledByLike(false);
  }, [messages]);
  
  
  const handleFindMessages = async () => {
    try{
      const toFind = window.prompt("Please enter what are you looking for:");
      if (toFind === "" || toFind === null){
        return
      }
      const response = await axios.get(`http://localhost:3333/messages/findMessages/${currentUser}/${selectedUser}/${toFind}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching found messages: ', error);
    }
  }


  const handleSendMessage = async () => {
    try {
      const senderId = currentUser;
      const receiverId = selectedUser;
      const formData = new FormData();
  
      if (selectedImage) {
        formData.append('file', selectedImage);
      }
  
      formData.append('senderId', String(senderId));
      formData.append('receiverId', String(receiverId));
      formData.append('messageContent', message);
  
      await axios.post(`http://localhost:3333/messages/create/${receiverId}/${senderId}`, formData);
  
      setMessage('');
      setSelectedImage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3>Chat with {selectedUserProfile?.username}</h3>
      <div
        ref={messagesContainerRef}
        style={{
          width: '500px',
          border: '1px solid #ccc',
          padding: '20px',
          borderRadius: '8px',
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: '400px',
        }}
      >
        {messages.map((msg) => (
  <div
    key={msg.id}
    style={{
      backgroundColor: msg.senderId === currentUser ? '#007bff' : '#e6e6e6',
      color: msg.senderId === currentUser ? 'white' : 'black',
      padding: '8px',
      borderRadius: '4px',
      marginBottom: '8px',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      position: 'relative',
    }}
    onDoubleClick={() => handleLikeMessage(msg.id, currentUser)}
  >
    {msg.isLiked && (
  <div
    style={{
      position: 'absolute',
      top: '8px',
      right: '8px',
      color: 'red',
    }}
  >
    <FontAwesomeIcon icon={faHeart} />
  </div>
)}
    {msg.messageImage && (
      <img
        src={msg.messageImage}
        alt="Sent Image"
        style={{
          maxWidth: '100%',
          maxHeight: '200px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={() => window.open(msg.messageImage, '_blank')}
      />
    )}
    {msg.messageContent && <p>{msg.messageContent}</p>}

    {msg.senderId === currentUser && (
      <FontAwesomeIcon
        icon={faTrash}
        style={{
          position: 'absolute',
          top: '8px',
          right: '30px',
          color: 'gray',
          cursor: 'pointer',
        }}
        onClick={() => handleDeleteMessage(msg.id)}
      />
    )}
  </div>
))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        <button
          style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
          onClick={handleButtonClick}
          >
          <FontAwesomeIcon icon={faPaperclip} />
        </button>
        <input
          type="text"
          placeholder="Type your message"
          style={{ flex: '1', padding: '8px', marginRight: '10px', marginLeft: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
      <br />
      <button
          style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'grey', color: 'white', border: 'none' }}
          onClick={handleFindMessages}
        >
          Find messages
      </button>
      <br />
      <button
          style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'red', color: 'white', border: 'none' }}
          onClick={onCloseChat}
          >
          <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};




const Messages = () => {
    const [systemUsers, setSystemUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [currentUserID, setCurrentUserID] = useState<number | null>(null);
    const [userImages, setUserImages] = useState<Record<number, string | undefined>>({});

    const fetchUserProfileImageByUsername = async (username: string, id: number) => {
      try {
            const response = await axios.get(`http://localhost:3333/users/${id}/profile-image`, {
              headers: {
                Authorization: "Bearer " + localStorage.getItem('accessToken')
              },
            });
              return response.data;
        }
      catch (error){
        console.error('Error fetching profile image:', error);
        return null;
      }
    };

    useEffect(() => {
      const fetchCurrentUserAndSystemUsers = async () => {
        try {
          const user = await getUser();
          setCurrentUserID(user);

          const response = await axios.get<User[]>('http://localhost:3333/users/all');

          for (const users of response.data) {
            const isBlocked = await axios.get(`http://localhost:3333/users/isBlockedByUser/${users.id}`, {
              headers: {
                  Authorization: "Bearer " + localStorage.getItem('accessToken')
              }
          });
            if (isBlocked.data.isBlocked) {
              response.data.splice(response.data.indexOf(users), 1);
            }
          }

          setSystemUsers(response.data);
    
          const images: Images = {};
    
          for (const user of response.data) {
            const img = await fetchUserProfileImageByUsername(user.username, user.id);
            images[user.username] = img || undefined;
          }
    
          setUserImages(images);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
    
      fetchCurrentUserAndSystemUsers();
    }, []);

    const handleProfileClick = (clickedUserId: number) => {
        setSelectedUser(clickedUserId);
    };

    const handleCloseChat = () => {
        setSelectedUser(null);
    };

    return (
        <Container className="mb-3 d-flex flex-column">
          <h2>Messages</h2>
          {selectedUser !== null ? (
            <ChatInterface selectedUser={selectedUser} currentUser={currentUserID} users={systemUsers} onCloseChat={handleCloseChat} />
          ) : (
            <UserProfileList users={systemUsers} currentUserID={currentUserID} onProfileClick={handleProfileClick} userImages={userImages} />
          )}
        </Container>
      );
};

export default Messages;