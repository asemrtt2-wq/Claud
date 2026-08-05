import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <div className="lumina-shell flex min-h-[70vh] items-center justify-center px-6 py-16">
        <ForgotPasswordForm />
      </div>
      <Footer />
    </>
  );
}
