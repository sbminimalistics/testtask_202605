import QuestList from "../components/game/messages/QuestList";

export default function GameMessagesView() {
    return (
        <section className={"content_box justify-items-start flex flex-col items-start gap-2"}>
            <div>messages</div>
            <QuestList />
        </section>
    );
}
