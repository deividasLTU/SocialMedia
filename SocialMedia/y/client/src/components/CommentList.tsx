// CommentList.js
import React from 'react';
import Comment from './Comment';

interface CommentList {
  comments: {   
      username: string
      text: string
      likes: number
      id: number
      postId: number
      userId: number }[];
}

const CommentList: React.FC<CommentList> = ({ comments }) => { 
    return (
  <div>
    {comments.map((comment, index) => (
      <Comment key={index} {...comment} />
    ))}
  </div>
);
    }
export default CommentList;