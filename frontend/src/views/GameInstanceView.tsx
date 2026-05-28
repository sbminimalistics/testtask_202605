import { Outlet } from "react-router";

export default function GameInstanceView() {
    return (
        <div className="w-full">
            <Outlet />
        </div>
    );
}
