import { CheckIcon } from '@chakra-ui/icons';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SlideFade,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { FC, useEffect, useRef, useState } from 'react';
import { FaKeyboard } from 'react-icons/fa';
import { HiCursorClick } from 'react-icons/hi';
import { VscDebugRestart } from 'react-icons/vsc';
import { challengeItems, randomChallenge } from '../../helpers/randomChallenge';
import useTimer from '../../helpers/useTimer';
import ProgressBar from './ProgressBar';
import Word from './Word';
import { ChallengeProps } from './challenges/challenge.interface';
import Result from './results/Result';

interface TypingTestProps {
  specificChallenge?: ChallengeProps;
}

const TypingTest: FC<TypingTestProps> = ({}) => {
  const [challenge, setChallenge] = useState<ChallengeProps>();
  const [wordSet, setWordSet] = useState<string[]>([]);
  const [letterSet, setLetterSet] = useState<string[]>([]);
  const [typedWordList, setTypedWordList] = useState<string[]>(['']);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [mistypedCount, setMistypedCount] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [testStatus, setTestStatus] = useState(0); // -1: test end, 0: waiting for test to start, 1: test ongoing
  const [timeTaken, setTimeTaken] = useState(0);
  const [wrongLettersInWord, setWrongLettersInWord] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [wrongLetters, setWrongLetters] = useState<number[]>([]);
  const [challengeType, setChallengeType] = useState('Books');
  const [result, setResult] = useState({
    wpm: 0,
    accuracy: 0,
    time: 0,
  });
  const INITIAL_TIME = 120;
  const [time, { startTimer, pauseTimer, resetTimer }] = useTimer(INITIAL_TIME); // default time is 120 seconds
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const challengeSwitchRef = useRef<HTMLButtonElement>(null);
  const challengeOptionRef = useRef<Array<HTMLButtonElement | null>>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const challenge = randomChallenge(challengeType);
    setChallenge(challenge);
  }, [challengeType]);

  useEffect(() => {
    if (challenge) {
      setLetterSet(challenge.content.split(''));
      setWordSet(challenge.content.split(' '));
    }
  }, [challenge]);

  useEffect(() => {
    const handleClickAway = (e: MouseEvent) => {
      if (showResults) return;
      if (
        challengeSwitchRef.current?.contains(e.target as Node) ||
        challengeOptionRef.current[0]?.contains(e.target as Node) ||
        challengeOptionRef.current[1]?.contains(e.target as Node) ||
        challengeOptionRef.current[2]?.contains(e.target as Node)
      )
        return;
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setTimeout(() => setIsFocused(false), 1000);
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, [containerRef]);

  // if finished word set or timer has ran out, stop the test
  useEffect(() => {
    if (
      (typedWordList.length >= wordSet.length &&
        typedWordList.at(-1) === wordSet.at(-1)) ||
      time === 0
    ) {
      pauseTimer();
      setTestStatus(-1);
      setTimeTaken(INITIAL_TIME - time);
    }
  }, [typedWordList, wordSet, time]);

  // generate result once test ends
  useEffect(() => {
    if (testStatus !== -1) return;
    const WPM = Math.floor((typedWordList.length / timeTaken) * 60);
    const accuracy = +(
      ((totalStrokes - mistypedCount) / totalStrokes) *
      100
    ).toFixed(2);
    setResult({
      wpm: WPM,
      accuracy,
      time: timeTaken,
    });
    setShowResults(true);
  }, [testStatus]);

  const restartTest = () => {
    resetTimer();
    setTestStatus(0);
    setTypedWordList(['']);
    setActiveWordIndex(0);
    setMistypedCount(0);
    setActiveLetterIndex(0);
    setTimeTaken(0);
    setWrongLettersInWord(0);
    setWrongLetters([]);
    setResult({
      wpm: 0,
      accuracy: 0,
      time: 0,
    });
    setShowResults(false);
    focusOnInput();
    clearInput();
    setChallenge(randomChallenge(challengeType, challenge?.id));
  };

  const focusOnInput = () => {
    setIsFocused(true);
    inputRef.current?.focus();
  };

  const clearInput = () => {
    inputRef.current!.value = '';
  };

  const handleTab = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      restartRef.current?.focus();
    }
    // inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight'
    ) {
      e.preventDefault();
    } else if (e.key === ' ') {
      if (wordSet[activeWordIndex] !== typedWordList[activeWordIndex]) {
        e.preventDefault();
      } else {
        setActiveWordIndex(typedWordList.length);
        setWrongLettersInWord(0);
      }
    } else if (e.key === 'Backspace') {
      if (wrongLettersInWord > 0) setWrongLettersInWord(wrongLettersInWord - 1);
      if (inputRef.current?.value.slice(-1) === ' ') e.preventDefault();
    } else if (e.key !== 'Shift') {
      setTotalStrokes(totalStrokes + 1);
    }
  };

  // function to handle each key press
  const handleKeyPress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (wrongLettersInWord >= 10) {
      inputRef.current!.value = inputRef.current?.value.slice(0, -1)!;
      return;
    }
    if (testStatus === 0) {
      startTimer();
      setTestStatus(1);
    }

    const typed = e.target.value;

    const lastTypedWord = typedWordList[typedWordList.length - 1];
    const currentLetterIndex = typed.length - 1;
    if (lastTypedWord?.length >= wordSet[activeWordIndex]?.length)
      setWrongLettersInWord(wrongLettersInWord + 1);
    if (
      typed.slice(-1) !== ' ' &&
      typed.slice(-1) !== letterSet[currentLetterIndex]
    ) {
      if (!wrongLetters.includes(currentLetterIndex)) {
        setWrongLetters([...wrongLetters, currentLetterIndex]);
        setMistypedCount(mistypedCount + 1);
      }
    } else if (typed.slice(-1) === letterSet[currentLetterIndex]) {
      setActiveLetterIndex(typed.length);
      if (wrongLetters.includes(currentLetterIndex)) {
        const filtered = wrongLetters.filter((x) => x !== currentLetterIndex);
        setWrongLetters(filtered);
      }
    }
    setTypedWordList(typed.split(' '));
  };

  const handleChallengeTypeSwitch = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setChallengeType(e.currentTarget.value);
    onClose();
  };
  return (
    <>
      <div
        className={
          'flex flex-col justify-center items-center gap-8 text-md md:text-lg lg:text-xl relative'
        }
        ref={containerRef}
        onKeyDown={handleTab}
        onClick={focusOnInput}
      >
        {!isFocused && !showResults && (
          <div
            onClick={focusOnInput}
            className='flex items-center gap-4 absolute z-10 text-white'
          >
            <HiCursorClick /> Click here to refocus
          </div>
        )}
        <div
          className={`flex flex-col justify-center items-center gap-4 h-full overflow-hidden ${
            !isFocused ? 'blur-sm' : ''
          } transition w-full`}
        >
          {!showResults ? (
            <>
              <div className='w-4/5 h-4'>
                <SlideFade in={testStatus === 1}>
                  <ProgressBar
                    lettersTyped={activeLetterIndex}
                    totalLetters={letterSet.length}
                  />
                </SlideFade>
              </div>
              <div
                className={`h-12 w-full flex items-center ${
                  testStatus === 1 ? 'justify-start' : 'justify-center'
                }`}
              >
                {testStatus === 1 && (
                  <SlideFade in={testStatus === 1}>
                    <div className='text-pink-8008'>{time}</div>
                  </SlideFade>
                )}
                {testStatus === 0 && (
                  <Button
                    ref={challengeSwitchRef}
                    iconSpacing={3}
                    leftIcon={<FaKeyboard size={20} />}
                    variant='ghost'
                    onClick={onOpen}
                  >
                    {challengeType}
                  </Button>
                )}
              </div>
              <div
                className='flex flex-wrap h-1/2 md:h-1/5 lg:sm:h-1/6 content-start 2xl:gap-y-4 mb-12 w-full'
                onClick={focusOnInput}
              >
                {wordSet.map((word, index) => (
                  <Word
                    key={index}
                    word={word}
                    typedWord={typedWordList[index]}
                    status={
                      index === activeWordIndex
                        ? 'active'
                        : index < activeWordIndex &&
                          typedWordList[index] === word
                        ? 'completed'
                        : 'idle'
                    }
                  />
                ))}
              </div>
              <input
                autoFocus
                type='text'
                onChange={handleKeyPress}
                onKeyDown={handleKeyDown}
                onPasteCapture={(e) => e.preventDefault()}
                ref={inputRef}
                className='absolute -z-10 border-none bg-transparent focus:outline-none caret-transparent text-transparent'
              />
            </>
          ) : (
            <Result
              result={result}
              showResults={showResults}
              challenge={challenge}
              timerRanOut={time === 0}
            />
          )}
          <Tooltip
            label='Restart Test'
            fontSize='md'
            aria-label='Restart test tooltip'
            className='font-mono'
          >
            <button
              onClick={restartTest}
              ref={restartRef}
              className='p-4 hover:text-white transition focus:text-white outline-none '
              tabIndex={0}
            >
              <VscDebugRestart size={25} />
            </button>
          </Tooltip>
        </div>
      </div>
      <Modal onClose={onClose} isOpen={isOpen} isCentered size='2xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Challenge Type</ModalHeader>
          <ModalBody className='flex flex-col gap-2'>
            {challengeItems.map((type, i) => (
              <Button
                key={i}
                // @ts-ignore
                ref={(el) => (challengeOptionRef.current[i] = el)}
                leftIcon={challengeType === type.name ? <CheckIcon /> : <div />}
                onClick={handleChallengeTypeSwitch}
                value={type.name}
              >
                <div className='w-full flex justify-between'>
                  <div>{type.name}</div>
                  <div className='text-lightgrey-8008'>{type.desc}</div>
                </div>
              </Button>
            ))}
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
};

export default TypingTest;
