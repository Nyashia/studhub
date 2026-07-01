import React, { createContext, useContext, useEffect, useState } from 'react';

const StudyContext = createContext();

export const useStudy = () => useContext(StudyContext);

export const StudyProvider = ({ children }) => {
    const [topics, setTopics] = useState([]);
    const [dueTopics, setDueTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prioritizedTopics, setPrioritizedTopics] = useState([]);


    const token = localStorage.getItem('token');
    const API_URL = 'http://localhost:5000/api/study';


    const fetchTopics = async () => {
        try {
            const res = await fetch(`${API_URL}/topics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setTopics(data);
        } catch (error) {
            console.error('Error fetching topics:', error);
        }
    };

    const fetchDueTopics = async () => {
        try {
            const res = await fetch(`${API_URL}/due`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setDueTopics(data);
        } catch (error) {
            console.error('Error fetching due topics:', error);
        }
    };

    const fetchPrioritizedTopics = async () => {
        try {
            const res = await fetch(`${API_URL}/priorities`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setPrioritizedTopics(data.priorities || []);
            return data;
        } catch (error) {
            console.error('Error fetching prioritized topics:', error);
           setPrioritizedTopics([]);
           throw error;
        }
           
    };

    const addTopic = async (topicData) => {
        try {
            const res = await fetch(`${API_URL}/topics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(topicData)
            });
            const data = await res.json();
            setTopics(prev => [...prev, data]);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const reviewTopic = async (id) => {
        try {
            const res = await fetch(`${API_URL}/topics/${id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            await fetchTopics();
            await fetchDueTopics();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deleteTopic = async (id) => {
        try {
            await fetch(`${API_URL}/topics/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchTopics();
            await fetchDueTopics();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    useEffect(() => {
        if (token) {
            fetchTopics();
            fetchDueTopics();
            setLoading(false);
        }
    }, [token]);

    return (
        <StudyContext.Provider value={{
            topics,
            dueTopics,
            prioritizedTopics,
            loading,
            addTopic,
            reviewTopic,
            deleteTopic,
            fetchTopics,
            fetchDueTopics,
            fetchPrioritizedTopics,
            isAuthenticated: !!token
        }}>
            {children}
        </StudyContext.Provider>
    );
};

