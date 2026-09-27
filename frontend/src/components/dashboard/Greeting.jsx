import React, { useState } from 'react';
import styles from '../../styles/dashboard.module.css';

const Greeting = ({ userName }) => {
  const greetingTemplates = [
    "Hey {name}",
    "lock in, {name}",
    "Let's crush it today {name}",
    "Welcome back {name}",
    "Rise and shine {name}",
    "What's cooking {name}",
    "{name}, you got this",
    "Look who's back",
    "What's the move {name}",
    "Let's get into it {name}",
    "Alright alright alright {name}",
    "You've got this (I think) {name}"
    
  ];

  const getRandomGreeting = () => {
    const randomIndex = Math.floor(Math.random() * greetingTemplates.length);
    return greetingTemplates[randomIndex].replace('{name}', userName);
  };

  const [greeting, setGreeting] = useState(getRandomGreeting());

  return (
    <div className={styles.greeting}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className={styles.greetingTitle}>{greeting}</h1>
        </div>
      </div>
    </div>
  );
};

export default Greeting;