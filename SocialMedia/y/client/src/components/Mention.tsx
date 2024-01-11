import axios from 'axios';
import React, { useEffect, useState } from 'react';

async function getUserByUsername(username: string) {
    try {
      const response = await axios.get(`http://localhost:3333/users/findByName/${username}`, {
        headers: {
            'Content-Type': 'application/json',
        }
      });
      //console.log("Mentions:", response.data);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  export default getUserByUsername;