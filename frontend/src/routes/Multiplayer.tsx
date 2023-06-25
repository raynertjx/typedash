import { Button } from '@chakra-ui/react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { randomChallenge } from '../helpers/randomChallenge';
import socket from '../services/socket';

interface MultiplayerProps {}

const Multiplayer: FC<MultiplayerProps> = ({}) => {
  const navigate = useNavigate();
  const challenge = randomChallenge();
  const createRoom = () => {
    socket.emit('createRoom', challenge);
    socket.on('roomCreated', (roomID) => {
      socket.emit('joinRoom', roomID);
      navigate(`/multiplayer/${roomID}`);
    });
  };

  return (
    <div className="flex flex-col justify-center">
      <Button variant="ghost" onClick={createRoom}>
        create room
      </Button>
    </div>
  );
};

export default Multiplayer;
