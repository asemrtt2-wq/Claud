import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <>
      <Header />
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-light px-6 py-16">
        <SignupForm />
      </div>
      <Footer />
    </>
  );
}
