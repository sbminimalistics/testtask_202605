import { Link } from "react-router";

export default function ChangeGameButton() {
    return (
        <Link to="/games" className="content_button">
            select game
        </Link>
    );
}
