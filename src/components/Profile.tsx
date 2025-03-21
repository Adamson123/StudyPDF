const Profile = () => {
  return (
    <div className="flex items-center gap-2">
      <img
        className="h-10 min-h-10 w-10 min-w-10 rounded-full border-2 object-contain"
        src="/ronaldo.png"
        alt="profile image"
      />
      <div className="flex flex-col">
        <p className="text-xs font-semibold text-muted-foreground">
          Adam movic
        </p>
        <span className="text-[10px] text-muted-foreground">
          movic22@gmail.com
        </span>
      </div>
    </div>
  );
};

export default Profile;
