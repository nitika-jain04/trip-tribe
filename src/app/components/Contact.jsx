import React from "react";
import Navbar from "./Navbar";

function Contact() {
  return (
    <div>
      <Navbar />

      <div className="flex flex-col items-center py-20 justify-center bg-yellow-300 text-black">
        <p>Get in Touch</p>
        <p>Have questions? We&apos;re here to help</p>
      </div>

      <div>
        <div>
          <p>Email Us</p>
          <p>For general inquiries and support</p>
          <p>contact@triptribe.in</p>
        </div>

        <div>
          <p>Whatsapp</p>
          <p>Quick questions and instant responses</p>
          <p>Chat on whatsapp</p>
        </div>
      </div>

      <div>
        <p>Send us a Message</p>
        <p>
          Fill out the form below and we&apos;ll get back to you within 24 hours
        </p>

        <form action="">
          <div>
            <div>
              <label htmlFor="">Full Name</label>
              <input type="text" placeholder="John Doe" />
            </div>

            <div>
              <label htmlFor="">Email</label>
              <input type="email" placeholder="john@example.com" />
            </div>
          </div>

          <div>
            <label htmlFor="">I am a</label>
            <input type="text" />
          </div>

          <div>
            <label htmlFor="">Message</label>
            <textarea name="" id=""></textarea>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Contact;
