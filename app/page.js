'use client';

import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
        color: 'white',
      }}
    >
      <Typography variant="h2" mb={4}>
        Welcome to VSCode Guide Bot
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => router.push('/chat')}
        sx={{
          bgcolor: '#2979FF',
          '&:hover': {
            bgcolor: '#2962FF',
          },
        }}
      >
        Chat Now!
      </Button>
    </Box>
  );
}
