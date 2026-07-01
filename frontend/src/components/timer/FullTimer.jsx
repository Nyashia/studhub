import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FullTimer = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [subject, setSubject] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const savedSubject = localStorage.getItem('studySubject');
        const savedDuration = localStorage.getItem('studyDuration');
        if (savedSubject) {
            setSubject(savedSubject);
            localStorage.removeItem('studySubject');
        }
        if (savedDuration) {
            setMinutes(parseInt(savedDuration));
            localStorage.removeItem('studyDuration');
        }
    }, []);

    useEffect(() => {
        let interval;
        if (isActive && (minutes > 0 || seconds > 0)) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                } else if (minutes > 0) {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                }
            }, 1000);
        } else if (isActive && minutes === 0 && seconds === 0) {
            setIsActive(false);
            // Play sound when timer ends
            const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
        return () => clearInterval(interval);
    }, [isActive, minutes, seconds]);

    const startTimer = () => setIsActive(true);
    const pauseTimer = () => setIsActive(false);

    const resetTimer = () => {
        setIsActive(false);
        setMinutes(25);
        setSeconds(0);
    };

    const addTime = (mins) => {
        let newMinutes = minutes + mins;
        if (newMinutes > 99) newMinutes = 99;
        setMinutes(newMinutes);
    };

    const subtractTime = (mins) => {
        let newMinutes = minutes - mins;
        if (newMinutes < 0) newMinutes = 0;
        setMinutes(newMinutes);
    };

    const formatNumber = (num) => num.toString().padStart(2, '0');

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            {/* Back button */}
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    position: 'absolute',
                    top: '30px',
                    left: '30px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    fontSize: '16px',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                }}
            >
                ← Back to Dashboard
            </button>

            {/* Subject Display */}
            <div style={{
                fontSize: '24px',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '20px'
            }}>
                {subject || 'Studying'}
            </div>

            {/* BIG TIMER */}
            <div style={{
                fontSize: '180px',
                fontWeight: '700',
                color: 'white',
                fontFamily: 'monospace',
                letterSpacing: '10px',
                textShadow: '0 0 50px rgba(0,0,0,0.3)',
                marginBottom: '40px'
            }}>
                {formatNumber(minutes)}:{formatNumber(seconds)}
            </div>

            {/* Timer Controls */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                {!isActive ? (
                    <button
                        onClick={startTimer}
                        style={{
                            padding: '15px 40px',
                            fontSize: '20px',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        ▶ Start
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        style={{
                            padding: '15px 40px',
                            fontSize: '20px',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer'
                        }}
                    >
                        ⏸ Pause
                    </button>
                )}

                <button
                    onClick={resetTimer}
                    style={{
                        padding: '15px 40px',
                        fontSize: '20px',
                        background: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        cursor: 'pointer'
                    }}
                >
                    ↺ Reset
                </button>
            </div>

            {/* Time Adjustment Buttons */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                <button
                    onClick={() => subtractTime(5)}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        cursor: 'pointer'
                    }}
                >
                    -5 min
                </button>
                <button
                    onClick={() => addTime(5)}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        cursor: 'pointer'
                    }}
                >
                    +5 min
                </button>
            </div>

            {/* Motivational Quote */}
            <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.4)',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                "The secret of getting ahead is getting started."
            </div>
        </div>
    );
};

export default FullTimer;  