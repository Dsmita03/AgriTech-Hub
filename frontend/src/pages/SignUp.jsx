import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignUp() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      let message = "Failed to create an account. Please try again.";
      const code = err?.code;
      if (code === "auth/email-already-in-use") message = "Email is already in use.";
      else if (code === "auth/invalid-email") message = "Invalid email address.";
      else if (code === "auth/weak-password") message = "Password is too weak.";
      setError(message);
    }
  };

  const signUpWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to sign up with Google. Please try again.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Form (matches Sign In styling) */}
      <main className="flex items-center justify-center p-6 sm:p-10 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/60">
        <Card className="w-full max-w-md shadow-lg border-emerald-100">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <span>🌿</span>
                <span className="text-sm font-medium">AgriTech-Hub</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Create your account
              </h1>
              <p className="text-sm text-slate-600">
                Join our community of modern farmers and agricultural experts.
              </p>
            </div>

            {/* Global error */}
            {error && (
              <div
                className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          inputMode="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="At least 8 characters"
                          autoComplete="new-password"
                          className="border-emerald-200 focus:border-emerald-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          className="border-emerald-200 focus:border-emerald-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Sign Up
                </Button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-slate-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={signUpWithGoogle}
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.5 16 18.9 12.9 24 12.9c3 0 5.7 1.1 7.8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.5 4 10 8.3 6.3 14.7z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.1 0 9.8-1.9 13.3-5.1l-6.1-5c-2 1.5-4.6 2.4-7.2 2.4-5.1 0-9.4-3.1-11-7.5l-6.7 5.2C10 39.7 16.5 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.9-5.1 6.9-9.3 6.9-5.1 0-9.4-3.1-11-7.5l-6.7 5.2C10 39.7 16.5 44 24 44c8.8 0 18-6.4 18-20 0-1.3-.1-2.6-.4-3.5z"
                    />
                  </svg>
                  Sign up with Google
                </Button>

                <p className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link to="/" className="text-emerald-700 hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      {/* Right: Visual Aside (matches Sign In) */}
      <aside className="relative hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2400&auto=format&fit=crop')",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/70 via-emerald-900/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
           <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <span>🌿</span>
              <span className="font-medium">AgriTech-Hub</span>
            </div>
            <h2 className="text-3xl font-bold leading-tight">
             Innovation mindset
            </h2>
            <p className="text-white/90">
              “Innovation in the field begins with insight in the farmer’s hands.”
            </p>
            <p className="text-white/70 text-sm">— Modern Farming Initiative</p>
          </div>
        </div>
      </aside>
    </div>
  );
}



 