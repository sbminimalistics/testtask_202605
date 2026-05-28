import PlayerReputation from "../components/game/PlayerReputation";
import ViewHeader from "./ViewHeader";

export default function ReputationView() {
    return (
        <section
            className={
                "content_box justify-items-start flex flex-col items-start gap-2"
            }
        >
            <ViewHeader title="reputation" />
            <PlayerReputation />
        </section>
    );
}
