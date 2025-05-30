import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";  // Added `useNavigate` for routing [NEW]
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { auth } from "@/lib/firebase";  // Import Firebase Auth [NEW]
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; // Import Firebase functions [NEW]

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignUp() {
  const [error, setError] = useState(null); // Added error state [NEW]
  const navigate = useNavigate();  // Initialize navigation [NEW]
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values) {  // Updated to handle Firebase authentication [NEW]
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      navigate("/dashboard");  // Redirect to dashboard after successful signup [NEW]
    } catch (error) {
      setError("Failed to create an account. Please try again.");
      console.error(error);
    }
  }

  async function signUpWithGoogle() {  // Google authentication function [NEW]
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");  // Redirect after Google sign-in [NEW]
    } catch (error) {
      setError("Failed to sign up with Google. Please try again.");
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="w-full grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Form Section */}
        <div className="flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-sm">🌿</span>
                <span className="text-sm font-medium">GreenAry Agriculture</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Ready to grow your farming success?</h1>
              <p className="text-xs text-muted-foreground">Join our community of modern farmers and agricultural experts.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Password"
                        {...field}
                        type="password"
                        className="border-green-200 focus:border-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm Password"
                        {...field}
                        type="password"
                        className="border-green-200 focus:border-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {error && <p className="text-red-500 text-sm">{error}</p>} {/* Show error message if signup fails [NEW] */}

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Sign Up
                </Button>
                <div className="w-full border-t border-green-200 my-1"></div>
                <p className="text-green-600 flex items-center justify-center">Or continue with</p>
                <Button variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50" onClick={signUpWithGoogle}> {/* Google Auth Button Click [NEW] */}
                  Sign up with Google
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account? <Link to="/" className="text-blue-600 hover:text-blue-800">Sign in</Link>
                </p>
              </form>
            </Form>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative hidden lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2940&auto=format&fit=crop')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-800/40" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <blockquote className="space-y-2">
              <p className="text-lg font-medium">
                "Sustainable farming isn't just about growing crops, it's about nurturing the future."
              </p>
              <footer className="text-sm">- Modern Farming Initiative</footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
