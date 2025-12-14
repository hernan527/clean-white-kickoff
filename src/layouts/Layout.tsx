import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background blobs - only visible in dark mode */}
      <div className="fixed inset-0 -z-10 overflow-hidden dark:block hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        <div className="absolute bottom-40 right-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-6000" />
      </div>

      {/* Light mode subtle background */}
      <div className="fixed inset-0 -z-10 overflow-hidden dark:hidden block">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl" />
      </div>
      
      <Header />
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
