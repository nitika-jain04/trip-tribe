"use client";

import React, { useState } from "react";
import Footer from "../components/Footer";
import { FiMail } from "react-icons/fi";
import { BsChat } from "react-icons/bs";
import Navbar from "../components/Navbar";
import TripDropdown from "../components/TripDropdown";

function Contact() {
  const [currentRole, setCurrentRole] = useState("Select your role");

  const role = ["Traveler", "Partner", "Other"];

  return (
    <div>
      <Navbar />

      <div className="flex flex-col gap-5 items-center py-28 justify-center bg-[#12223b] text-white">
        <p className="text-4xl md:text-6xl tracking-tight font-bold">
          Get in Touch
        </p>
        <p className="text-xl md:text-2xl text-center">
          Have questions? We&apos;re here to help
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 justify-between py-24 md:py-32 md:px-10">
        <div className="flex flex-col gap-4 items-center">
          <div className="p-4 text-white bg-[#6dd5ce] rounded-full">
            <FiMail size={30} />
          </div>
          <p className="text-2xl font-bold text-foreground">Email Us</p>
          <p className="text-overlay-muted text-center">
            For general inquiries and support
          </p>
          <a
            href="mailto:contact@triptribe.in?subject=TripTribe%20Support%20Inquiry&body=Hi%20TripTribe%20Team,%0A%0AI'm%20reaching%20out%20regarding%20...%0A%0AThanks,"
            className="cursor-pointer text-primary-aqua text-base hover:underline"
          >
            contact@triptribe.in
          </a>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <div className="p-4 text-white bg-blue-500 rounded-full">
            <BsChat size={30} />
          </div>
          <p className="text-2xl font-bold">WhatsApp</p>
          <p className="text-overlay-muted text-center">
            Quick questions and instant responses
          </p>
          <a
            href="https://wa.me/917007755306?text=Hi%20TripTribe%20Team,%0A%0AI%20would%20like%20to%20know%20more%20about%20your%20trips.%0A%0AThanks!"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-aqua text-base cursor-pointer hover:underline"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="px-10 md:px-28 flex flex-col gap-2 pb-40">
        <p className="text-3xl font-bold text-center text-[#0A121F] pb-2">
          Send us a Message
        </p>
        <p className="text-center text-gray-500">
          Fill out the form below and we&apos;ll get back to you within 24 hours
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-5 py-5"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:gap-10 items-center justify-between">
            <div className="flex flex-col w-full gap-2.5">
              <label className="text-sm tracking-wide">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-2 focus:border-primary-aqua placeholder:text-sm"
              />
            </div>

            <div className="flex flex-col w-full gap-2.5">
              <label className="text-sm tracking-wide">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-2 focus:border-primary-aqua placeholder:text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col w-full gap-2.5">
            {/* <label className="text-sm tracking-wide">I am a</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-2 focus:border-primary-aqua"
            /> */}
            <label className="text-sm tracking-wide">I am a</label>

            <TripDropdown
              options={role}
              value={currentRole}
              onChange={setCurrentRole}
            />
          </div>

          <div className="flex flex-col w-full gap-2.5">
            <label className="text-sm tracking-wide">Message</label>
            <textarea
              rows={5}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-2 focus:border-primary-aqua placeholder:text-sm"
              placeholder="How can we help you?"
            ></textarea>
          </div>

          <button
            type="submit"
            className="mt-6 text-white text-sm bg-primary-aqua rounded-lg py-3 px-4"
          >
            Send Message
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Contact;
