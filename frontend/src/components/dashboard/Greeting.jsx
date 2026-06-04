import React, { useState } from 'react';
import styles from "../../styles/dashboard.module.css";

const Greeting = ({ userName }) => {
  const greetingTemplates = [
    "Hey {name}",
    "Time to lock in {name}",
    "Let's crush it today {name}",
    "Welcome back {name}",
    "Another day, another grind {name}",
    "Rise and shine {name}",
    "What's cooking {name}",
    "Stay focused {name}",
    "Let's get these wins {name}",
    "{name}, you got this"
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
          <p className={styles.greetingSubtitle}>Here's what's happening with your studies today.</p>
        </div>
      </div>
    </div>
  );
};

export default Greeting;