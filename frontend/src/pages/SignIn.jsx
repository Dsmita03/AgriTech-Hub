import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  rememberMe: z.boolean().optional(),
});

export default function SignIn() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      setError("Google sign-in failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-green-50 via-white to-green-50">
      <div className="w-full grid min-h-screen grid-cols-1 lg:grid-cols-2">
        
        {/* Image Section */}
        <div className="relative hidden lg:block w-full h-screen">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-green-600/20 to-green-800/40" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <blockquote className="space-y-2">
              <p className="text-lg font-medium">"Sustainable farming isn't just about growing crops, it's about nurturing the future."</p>
              <footer className="text-sm">- Modern Farming Initiative</footer>
            </blockquote>
          </div>
        </div>

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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Sign In
                </Button>

                {/* Divider and Google Sign-In Option */}
                <div className="w-full border-t border-green-200 my-1"></div>
                <p className="text-green-600 flex items-center justify-center">Or continue with</p>
                <Button 
                  variant="outline" 
                  className="w-full border-green-600 text-green-700 hover:bg-green-50" 
                  onClick={handleGoogleSignIn}
                >
                  Sign in with Google
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-green-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </div>

      </div>
    </div>
  );
}
