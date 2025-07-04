export function Footer() {
  return (
    <footer className="bg-card/50 shadow-inner mt-auto">
      <div className="container mx-auto p-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Recipe Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}
