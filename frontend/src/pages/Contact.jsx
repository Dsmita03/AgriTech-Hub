import React from 'react'
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, User, MessageSquare, Import } from "lucide-react";
const Contact = () => {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  
  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("access_key", accessKey);

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: json
    }).then((res) => res.json());

    if (res.success) {
      console.log("Success", res);
      event.target.reset();
     
    }
    else{
      console.log("Error", res);
    }
  };
  return (
    <div className="flex h-screen w-full">
      {/* Left Side - Image */}
      <div className="w-1/2 hidden md:block">
        <img
          src="/contactPage.jpg" // Replace with your actual image
          alt="Contact Us"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Contact Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-100 text-white p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-slate-900">Get in Touch</h2>

          {/* Name Field */}
        <form onSubmit={onSubmit}>
        <div className="mb-4 relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" />
            <Input
              type="text"
              name="name"
              placeholder="Your Name"
              className="pl-10 bg-green-200 border-none  text-slate-900 placeholder-gray-700 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" />
            <Input
              type="email"
              name="email"
              placeholder="Your Email"
              className="pl-10 bg-green-200 border-none  text-slate-900 placeholder-gray-700 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Message Field */}
          <div className="mb-4 relative">
            <MessageSquare className="absolute left-3 top-4 text-gray-800" />
            <Textarea
              placeholder="Your Message"
              name="message"
              className="pl-10 bg-green-200 border-none text-slate-900 placeholder-gray-700 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Submit Button */}
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" type="submit">  
            Send Message
          </Button>
        </form>
        </div>
      </div>
    </div>
  )
}

export default Contact