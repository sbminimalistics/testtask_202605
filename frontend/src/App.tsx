import GameInstanceView from "./views/GameInstanceView.tsx";
import { Routes, Route, Outlet, Link } from "react-router-dom";

import "./styles.css";
import Header from "./Header.tsx";
import PlayerReputation from "./components/game/PlayerReputation.tsx";
import Games from "./views/Games.tsx";
import StatusBar from "./StatusBar.tsx";
import ProductList from "./components/game/product/ProductList.tsx";
import Home from "./views/Home.tsx";
import GameMessagesView from "./views/GameMessagesView.tsx";

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
                                element={<PlayerReputation />}
                            />
                            <Route path="shop" element={<ProductList />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NoMatch />} />
                </Route>
            </Routes>
        </div>
    );
}

function Layout() {
    return (
        <>
            {/* <DebugPanel /> */}
            <Header />

            <div className="p-4 text-sm">
                <Outlet />
            </div>
            <StatusBar />
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
