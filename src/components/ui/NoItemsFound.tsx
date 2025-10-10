const NoItemsFound = ({ text }: { text: string }) => {
    return (
        <div className="w-full rounded-lg bg-secondary p-4 text-center text-sm text-secondary-foreground">
            {text}
        </div>
    );
};

export default NoItemsFound;
