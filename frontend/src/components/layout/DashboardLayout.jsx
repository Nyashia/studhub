import React from "react";
import "../../styles/global.css";
import "./dashboard.css";

const DashboardLayout = ({ children }) => {
    const iconStyle = { color: "rgb(18, 63, 95)", marginRight: "0.5em" };

    return (
        <div className="dashboard">

            
            <aside className="sidebar">
                <h2>StudHub</h2>

                <ul>
                    <li>
                        <i className="fa-solid fa-house" style={iconStyle}></i> home
                    </li>
                    <li>
                        <i className="fa-solid fa-graduation-cap" style={iconStyle}></i> assessments
                    </li>
                    <li>
                        <i className="fa-solid fa-list" style={iconStyle}></i> topics
                    </li>
                    <li>
                        <i className="fa-solid fa-book" style={iconStyle}></i> study
                    </li>
                    <li>
                     <i className="fa-solid fa-children" style={{ color: "rgb(18, 63, 95)" }}></i> accountability buddy
                    </li>
                    <li>
                        <i className="fa-solid fa-gear" style={{ color: "rgb(18, 63, 95)" }}></i> settings
                    </li>
                </ul>
            </aside>

            

            <main className="content">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;