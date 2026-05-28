export default function ViewHeader({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="px-4 bg-neutral-primary text-base font-semibold text-gray-500">
                {title}
            </div>
            <div className="w-75 h-px my-1 bg-gray-300 border-0 rounded-sm"></div>
        </div>
    );
}
