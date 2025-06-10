import React from "react";

export default function PlayerLayout({ children }) {
    return (
        <div>
            {/* <header style={{ padding: "1rem", background: "#f0f0f0" }}>
                <h1>Dummy Header</h1>
            </header> */}
            <main>{children}</main>
        </div>
    );
}