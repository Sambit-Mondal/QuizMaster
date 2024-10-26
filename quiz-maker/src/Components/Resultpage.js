import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ResultStats from './ResultStats';
import { Typography, styled } from '@mui/material';
import UserScoresTable from './UserScorestable';
import PageLoader from './PageLoader';

const ResultPage = () => {
  document.title = 'Result | QuizMaster';
  const [isstatsLoading, setIsStatsLoading] = useState(true);
  const [isScoresLoading, setIsScoresLoading] = useState(true);
  const [isMyScoreLoading, setIsMyScoreLoading] = useState(true);
  const { quizid } = useParams();
  const [quizStats, setQuizStats] = useState({});
  const [userScores, setUserScores] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const navigate = useNavigate();
  const StyledTypography = styled(Typography)({
    marginBottom: '30px',
    fontFamily: 'Wittgenstein, serif',
    color: '#235',
    borderBottom: '2px solid #235',
    paddingBottom: '25px',
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      const pathURL = window.location.pathname.split('/').join('/').substring(1);
      localStorage.setItem('attemptedRoute', JSON.stringify({ pathURL }));
      return (window.location.href = '/login');
    }

    const fetchQuizStats = async () => {
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/quizzes/stats/${quizid}`;
        const response = await fetch(url, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        if (!response.ok) throw new Error('Failed to fetch quiz statistics');
        const data = await response.json();
        setQuizStats(data);
        setIsStatsLoading(false);
      } catch (error) {
        console.error('Error fetching quiz statistics:', error);
        navigate('/404');
        setIsStatsLoading(false);
      }
    };

    const fetchUserScores = async () => {
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/quizzes/scores/${quizid}`;
        const response = await fetch(url, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        if (!response.ok) throw new Error('Failed to fetch user scores');
        const data = await response.json();
        const sortedUsers = data.sort((a, b) => b.score - a.score);
        setUserScores(sortedUsers);
        setIsScoresLoading(false);
      } catch (error) {
        console.error('Error fetching user scores:', error);
        navigate('/404');
        setIsScoresLoading(false);
      }
    };

    const fetchMyScore = async () => {
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/quizzes/results/${quizid}`;
        const response = await fetch(url, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        if (!response.ok) throw new Error('Failed to fetch user score');
        const data = await response.json();
        setMyScore(data.score);
        setIsMyScoreLoading(false);
      } catch (error) {
        console.error('Error fetching my score:', error);
        setIsMyScoreLoading(false);
      }
    };

    fetchQuizStats();
    fetchUserScores();
    fetchMyScore();
  }, [quizid]);

  return (
    <>
      {isstatsLoading && isScoresLoading && isMyScoreLoading && <PageLoader />}
      {!isstatsLoading && !isScoresLoading && !isMyScoreLoading && (
        <div className="bg-gray-800 p-5 flex flex-col items-center">
          <div className="bg-white rounded-lg p-5 mb-5 w-full max-w-4xl shadow-md">
            <StyledTypography variant="h4">Result Page</StyledTypography>
            <button
              className="bg-gray-700 text-white border-none py-2 px-4 rounded hover:bg-gray-600 mb-5"
              onClick={() => (window.location.href = '/dashboard')}
            >
              &#8592; Back to Dashboard
            </button>
            <div>
              <ResultStats data={quizStats} myScore={myScore} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 w-full max-w-4xl shadow-md">
            <div className="mt-5">
              <UserScoresTable users={userScores} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultPage;