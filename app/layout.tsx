
export const metadata = {
  title: "TimmyTracker Auth",
  description: "Auth service for TimmyTracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#070A12", color: "white" }}>
        {children}
      </body>
    </html>
  );
}
