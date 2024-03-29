import { CheckIcon } from '@chakra-ui/icons';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { FaKeyboard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ChallengeProps } from '../components/typing/challenges/challenge.interface';
import { challengeItems, randomChallenge } from '../helpers/randomChallenge';
import socket from '../services/socket';

interface MultiplayerProps {}

const Multiplayer: FC<MultiplayerProps> = ({}) => {
  const [challenge, setChallenge] = useState<ChallengeProps>();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getDefaultChallengeType = () => {
    const storedChallenge = localStorage.getItem('challenge-type');
    if (storedChallenge !== null) return storedChallenge;
    else return 'Books';
  };

  const [challengeType, setChallengeType] = useState(getDefaultChallengeType());

  useEffect(() => {
    const chosenChallenge = randomChallenge(challengeType);
    setChallenge(chosenChallenge);
  }, [challengeType]);

  useEffect(() => {
    socket.on('roomCreated', (roomID) => {
      navigate(`/multiplayer/${roomID}`);
    });
  }, []);

  const createRoom = () => {
    socket.emit('createRoom', challenge);
  };

  const handleChallengeTypeSwitch = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setChallengeType(e.currentTarget.value);
    onClose();
  };

  return (
    <div className='flex flex-col justify-center'>
      <>
        <Button
          iconSpacing={3}
          leftIcon={<FaKeyboard size={20} />}
          variant='ghost'
          onClick={onOpen}
          colorScheme='primary'
          color='text.primary'
        >
          {challengeType}
        </Button>
        <Modal onClose={onClose} isOpen={isOpen} isCentered size='2xl'>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Challenge Type</ModalHeader>
            <ModalBody className='flex flex-col gap-2'>
              {challengeItems.map((type, i) => (
                <Button
                  key={i}
                  leftIcon={
                    challengeType === type.name ? <CheckIcon /> : <div />
                  }
                  onClick={handleChallengeTypeSwitch}
                  value={type.name}
                >
                  <div className='w-full flex justify-between'>
                    <div>{type.name}</div>
                    <div>{type.desc}</div>
                  </div>
                </Button>
              ))}
            </ModalBody>
            <ModalFooter />
          </ModalContent>
        </Modal>
      </>
      <Button
        variant='ghost'
        colorScheme='primary'
        color='text.primary'
        onClick={createRoom}
      >
        Create Room
      </Button>
    </div>
  );
};

export default Multiplayer;
