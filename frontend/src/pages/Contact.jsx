import React from "react";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, User, MessageSquare } from "lucide-react";

const Contact = () => {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  const [submitting, setSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState({ type: "", message: "" });

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!accessKey) {
      setStatus({ type: "error", message: "Form is not configured. Missing access key." });
      return;
    }

    const form = event.target;
    const formData = new FormData(form);

    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const message = formData.get("message")?.toString().trim();

    if (!name || !email || !message) {
      setStatus({ type: "error", message: "Please fill out all fields." });
      return;
    }

    formData.append("access_key", accessKey);

    try {
      setSubmitting(true);
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      }).then((r) => r.json());

      if (res.success) {
        setStatus({ type: "success", message: "Message sent successfully!" });
        form.reset();
      } else {
        setStatus({ type: "error", message: res.message || "Failed to send message." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error. Please try again." });
      console.error("Contact form error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Lock the page height and hide overflow to remove scrollbars
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white flex flex-col">
      {/* Keep header fixed height and prevent it from pushing content */}
      <div className="shrink-0">
        <Header />
      </div>

      {/* Main fills remaining space; prevent overflow */}
      <main className="flex-1 overflow-hidden">
        {/* Full-height content row */}
        <div className="h-full w-full flex">
          {/* Left image pane (hidden on small screens), contain image without overflow */}
          <div className="hidden md:block md:w-1/2 h-full">
            <img
              src="/contactPage.jpg"
              alt="Farmer’s field and communication concept"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Right form pane; use max-w and internal scroll if absolutely necessary */}
          <div className="w-full md:w-1/2 h-full bg-slate-100 flex items-center justify-center">
            <div className="w-full max-w-md px-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-slate-900">
                Get in Touch
              </h2>

              {/* Status messages */}
              {status.message && (
                <div
                  className={`mb-3 rounded-md px-4 py-3 text-sm ${
                    status.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {status.message}
                </div>
              )}

              <form onSubmit={onSubmit} noValidate className="space-y-3">
                {/* Name */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    className="pl-10 bg-green-200 border-none text-slate-900 placeholder-gray-700 focus:ring-2 focus:ring-green-500"
                    required
                    maxLength={120}
                    aria-label="Your Name"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    className="pl-10 bg-green-200 border-none text-slate-900 placeholder-gray-700 focus:ring-2 focus:ring-green-500"
                    required
                    aria-label="Your Email"
                  />
                </div>

                {/* Message */}
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-4 text-gray-700" />
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    className="pl-10 min-h-[110px] md:min-h-[130px] bg-green-200 border-none text-slate-900 placeholder-gray-700 focus:ring-2 focus:ring-green-500"
                    required
                    maxLength={2000}
                    aria-label="Your Message"
                  />
                </div>

                {/* Submit */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>

              {/* Tiny footer note trimmed to avoid overflow; can be removed */}
              <p className="mt-3 text-[11px] text-slate-600 text-center">
                Powered by Web3Forms.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
