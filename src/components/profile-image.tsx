export default function ProfileImage({
  user,
}: {
  user: { image?: string | null; name?: string | null };
}) {
  const initials = (user?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
      {user?.image ? (
        <img
          src={user.image}
          alt={user.name || "profile_image"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
