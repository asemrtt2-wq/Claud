import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="lumia-shell flex min-h-[70vh] items-center justify-center px-6 py-16">
        <LoginForm />
      </div>
      <Footer />
    </>
  );
}
