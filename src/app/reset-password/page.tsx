import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <Header />
      <div className="lumina-shell flex min-h-[70vh] items-center justify-center px-6 py-16">
        <ResetPasswordForm token={token ?? ""} />
      </div>
      <Footer />
    </>
  );
}
