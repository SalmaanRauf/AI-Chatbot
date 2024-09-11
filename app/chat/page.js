'use client';

import { Box, Button, Stack, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

// Use environment variable for API key
const API_KEY = process.env.NEXT_PUBLIC_API_KEY; 
const MODEL_NAME = 'gemini-1.0-pro-001';

const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to the VSCode guide bot! How can I help you?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = await genAI
          .getGenerativeModel({ model: MODEL_NAME })
          .startChat({
            generationConfig,
            safetySettings,
          });
        setChat(newChat);
      } catch (err) {
        setError(err.message);
      }
    };

    initChat();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) {
      return; // Do nothing if the input is empty
    }

    const userMessage = {
      content: message,
      role: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessage('');
    setIsLoading(true); // Set loading to true

    try {
      if (chat) {
        const result = await chat.sendMessage(message);
        const assistantMessage = {
          content: result.response.text(),
          role: 'assistant',
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      setError('Failed to send message. Please try again.');
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'An error occurred while processing your request.' },
      ]);
    } finally {
      setIsLoading(false); // Set loading to false when done
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
      }}
    >
      <Stack
        direction={'column'}
        sx={{
          width: '80%',
          height: '80%',
          maxWidth: '800px',
          border: '1px solid #333',
          borderRadius: '12px',
          p: 3,
          spacing: 3,
          backgroundColor: '#1E1E1E',
        }}
      >
        <Stack
          direction={'column'}
          spacing={2}
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            maxHeight: 'calc(100% - 70px)',
            mb: 2,
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                sx={{
                  bgcolor: message.role === 'assistant' ? '#2979FF' : '#00C853',
                  color: 'white',
                  borderRadius: '20px',
                  p: 2,
                  maxWidth: '70%',
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        {isLoading && (
          <Box
            sx={{
              bgcolor: '#2979FF',
              color: 'white',
              borderRadius: '20px',
              p: 2,
              alignSelf: 'flex-start',
              mb: 2,
            }}
          >
            Just a moment...
          </Box>
        )}
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(); // Send message on Enter key press
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#555',
                },
                '&:hover fieldset': {
                  borderColor: '#777',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2979FF',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#888',
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{
              bgcolor: '#2979FF',
              '&:hover': {
                bgcolor: '#2962FF',
              },
            }}
          >
            Send
          </Button>
        </Stack>
        {error && (
          <Box color="#FF5252" mt={2}>
            {error}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
