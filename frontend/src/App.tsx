import GameInstanceView from "./views/GameInstanceView.tsx";
import { Routes, Route, Outlet, Link } from "react-router-dom";

import "./styles.css";
import Header from "./Header.tsx";
import Games from "./views/Games.tsx";
import Home from "./views/Home.tsx";
import GameMessagesView from "./views/GameMessagesView.tsx";
import { ToastContainer } from "react-toastify";
import ShopView from "./views/ShopView.tsx";
import ReputationView from "./views/ReputationView.tsx";
import ToastController from "./components/ToastController.tsx";

export default function App() {
    return (
        <div className="h-full">
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="games" element={<Games />}>
                        <Route path=":gameId" element={<GameInstanceView />}>
                            <Route
                                path="messages"
                                element={<GameMessagesView />}
                            />
                            <Route
                                path="reputation"
                                element={<ReputationView />}
                            />
                            <Route path="shop" element={<ShopView />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NoMatch />} />
                </Route>
            </Routes>
            <ToastContainer position="bottom-left" />
            <ToastController />
        </div>
    );
}

function Layout() {
    return (
        <>
            <Header />

            <div className="p-4 text-sm">
                <Outlet />
            </div>
        </>
    );
}

function NoMatch() {
    return (
        <div>
            <h2>Nothing to see here!</h2>
            <p>
                <Link to="/">Go to the home page</Link>
            </p>
        </div>
    );
}
