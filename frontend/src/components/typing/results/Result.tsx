import { Fade } from '@chakra-ui/react';
import { FC } from 'react';
import { ChallengeProps } from '../challenges/Books.constants';

interface ResultProps {
  result: {
    wpm: number;
    accuracy: number;
    time: number;
  };
  showResults: boolean;
  challenge: ChallengeProps | undefined;
  timerRanOut: boolean;
}

const Result: FC<ResultProps> = ({
  result,
  showResults,
  challenge,
  timerRanOut,
}) => {
  return (
    <Fade in={showResults} className="w-3/4">
      <div className="flex justify-between pb-12">
        <div className="text-left">
          <div className="text-4xl text-pink-8008">{challenge?.title}</div>
          <div className="text-xl">{`by ${challenge?.author}`}</div>
        </div>
        {timerRanOut && (
          <div className="text-right text-4xl italic">incomplete test</div>
        )}
      </div>
      <div className="flex justify-between">
        <div className="text-left">
          <div className="font-bold text-6xl">wpm</div>
          <div className="font-medium text-4xl text-pink-8008">
            {result.wpm}
          </div>
        </div>
        <div className="text-left">
          <div className="font-bold text-6xl">accuracy</div>
          <div className="font-medium text-4xl text-pink-8008">
            {`${result.accuracy}%`}
          </div>
        </div>
        <div className="text-left">
          <div className="font-bold text-6xl">time</div>
          <div className="font-medium text-4xl text-pink-8008">
            {!timerRanOut ? `${result.time}s` : '-'}
          </div>
        </div>
      </div>
    </Fade>
  );
};

export default Result;
