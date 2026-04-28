import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-split-right" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <section className="auth-form-container" style={{ maxWidth: 520, width: "100%" }}>
        <h1 className="auth-form-title" style={{ marginBottom: "0.75rem" }}>Reset Password</h1>
        <p className="auth-form-subtitle" style={{ marginBottom: "1.25rem" }}>
          Password reset is not enabled yet. Please contact your admin to reset your password.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/login" className="auth-footer-link">Back to login</Link>
          <Link href="/signup" className="auth-footer-link">Create a new account</Link>
        </div>
      </section>
    </main>
  );
}
