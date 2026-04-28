import { useState } from "react";

const Greeting = ({ userName }) => {
    //greeting templates array
    const greetingTemplates = [
        "Hey, {name}",
        "Welcome back {name}",
        "What's cooking {name}",
        "Let's crush it today {name}",
        "{name}, you got this!"
    ];

    const getRandomGreeting = () => {
        const randomIndex = Math.floor(Math.random() * greetingTemplates.length);
        return greetingTemplates[randomIndex].replace('{name}', userName || 'bud');
    };

    const [greeting, setGreeting] = useState(getRandomGreeting());

    // Refresh greeting function
    const refreshGreeting = () => {
        setGreeting(getRandomGreeting());
    };


    return (
        <div className="greeting-container">
            <h1>{greeting}</h1>
        </div>
    );
};

export default Greeting;