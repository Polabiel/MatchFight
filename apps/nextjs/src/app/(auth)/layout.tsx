export const metadata = {
  title: "MatchFight - Auth",
  description: "Authentication pages for MatchFight",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-background border-border w-full space-y-8 border p-6 sm:max-w-md lg:max-w-xl">
        {children}
      </div>
    </div>
  );
}
