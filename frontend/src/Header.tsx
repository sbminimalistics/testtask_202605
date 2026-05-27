import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import "./styles.css";
import { useAppSelector } from "./store/store";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const gameId = useAppSelector((state) => state.gameInstance.gameId);

    const linkStyle = ({ isActive }: { isActive: boolean }) => {
        return `${
            isActive ? "bg-amber-700" : "bg-gray-500"
        } rounded-sm text-white p-2 text-center`;
    };

    return (
        <div
            id="header"
            className="sticky flex flex-col gap-2 text-base bg-gray-100 top-0"
        >
            <div className="flex items-center justify-between self-stretch p-2">
                <span className="text-lg font-semibold text-gray-500 italic">
                    <Link to="/">Visual adventure</Link>
                </span>
                <button
                    className={`hamburger opacity-50 ${isOpen ? "is-active" : ""}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>
            {isOpen && (
                <div
                    className="flex flex-col gap-1 items-stretch sm:items-end text-right bg-gray-200/50 p-2"
                    onClick={() => setIsOpen(false)}
                >
                    <NavLink to="/games" end className={linkStyle}>
                        games started
                    </NavLink>
                    {gameId && (
                        <div className="flex flex-col bg-gray-300 rounded-sm p-2 gap-2">
                            <div className="text-sm flex gap-1 self-end">
                                active game
                                <span className="italic font-semibold">{`${gameId}`}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-1 sm:justify-end">
                                <NavLink
                                    to={`/games/${gameId}/messages`}
                                    className={linkStyle}
                                >
                                    messages
                                </NavLink>
                                <NavLink
                                    to={`/games/${gameId}/shop`}
                                    className={linkStyle}
                                >
                                    shop
                                </NavLink>
                                <NavLink
                                    to={`/games/${gameId}/reputation`}
                                    className={linkStyle}
                                >
                                    reputation
                                </NavLink>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
