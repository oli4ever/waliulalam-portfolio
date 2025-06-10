import { useRef, useState } from "react";
import TitleHeader from "../components/TitleHeader";
import ContactExperience from "../components/models/contact/ContactExperience";

const Contact = () => {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: null,
    email: null,
    message: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(false);
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate name
    if (!form.name || !form.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    } else if (form.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Validate email
    if (!form.email || !form.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate message
    if (!form.message || !form.message.trim()) {
      errors.message = "Message is required";
      isValid = false;
    } else if (form.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Development fallback - simulate email sending
  const simulateEmailSending = async () => {
    console.log("Development mode: Simulating email sending...");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Log form data
    console.log("Form data that would be sent:", {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
      timestamp: new Date().toISOString(),
    });

    // Simulate success (you can change this to test error handling)
    const shouldSucceed = Math.random() > 0.1; // 90% success rate

    if (shouldSucceed) {
      return {
        success: true,
        message: "Email sent successfully (simulated)",
        messageId: `dev-${Date.now()}`,
      };
    } else {
      throw new Error("Simulated network error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");

    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      console.log("Form validation failed");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting to send email...");

      // Simplified API URL logic
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const apiUrl = isLocalhost ? "/api/send-email" : "/api/send-email";

      console.log("Using API URL:", apiUrl);
      console.log("Current hostname:", window.location.hostname);
      console.log("Form data:", {
        name: form.name.trim(),
        email: form.email.trim(),
        messageLength: form.message.trim().length,
      });

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("Request timeout triggered");
        controller.abort();
      }, 30000); // Increased timeout for Vercel

      const fetchResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Response received:");
      console.log("Status:", fetchResponse.status);
      console.log("Status Text:", fetchResponse.statusText);
      console.log(
        "Headers:",
        Object.fromEntries(fetchResponse.headers.entries())
      );

      let responseData;
      const contentType = fetchResponse.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          responseData = await fetchResponse.json();
          console.log("Response data:", responseData);
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", jsonError);
          const textResponse = await fetchResponse.text();
          console.log("Raw response:", textResponse);
          throw new Error(
            `Invalid JSON response: ${textResponse.substring(0, 200)}...`
          );
        }
      } else {
        const textResponse = await fetchResponse.text();
        console.log("Non-JSON response:", textResponse);
        throw new Error(
          `Server returned non-JSON response: ${textResponse.substring(
            0,
            200
          )}...`
        );
      }

      if (!fetchResponse.ok) {
        console.error(
          "Server returned error:",
          fetchResponse.status,
          responseData
        );
        const errorMessage =
          responseData?.error ||
          responseData?.message ||
          `Server error: ${fetchResponse.status} ${fetchResponse.statusText}`;
        throw new Error(errorMessage);
      }

      if (!responseData.success) {
        console.error("Email sending failed:", responseData);
        throw new Error(responseData.error || "Failed to send message");
      }

      console.log("Email sent successfully:", responseData);

      // Success! Reset form and show success message
      setForm({ name: "", email: "", message: "" });
      setSuccess(true);
      setFieldErrors({ name: null, email: null, message: null });

      // Auto-hide success message after 8 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 8000);
    } catch (error) {
      console.error("Email submission error:", error);

      let errorMessage;

      if (error.name === "AbortError") {
        errorMessage =
          "Request timed out. The server may be busy. Please try again in a moment.";
      } else if (
        error.message.includes("fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network error. Please check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.";
      } else if (error.message.includes("EAUTH")) {
        errorMessage =
          "Email authentication failed. Please contact the site administrator.";
      } else if (error.message.includes("ECONNECTION")) {
        errorMessage =
          "Unable to connect to email server. Please try again later.";
      } else if (error.message.includes("Invalid email credentials")) {
        errorMessage =
          "Email service configuration error. Please contact the site administrator.";
      } else {
        errorMessage =
          error.message || "Failed to send message. Please try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("Form submission completed");
    }
  };

  return (
    <section id="contact" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="Let's Build Something Great Together"
          sub="Ready to elevate your digital presence? Get in touch today. 🚀"
        />
        <div className="grid-12-cols mt-16">
          <div className="xl:col-span-5">
            <div className="flex-center card-border rounded-xl p-10">
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-7"
                noValidate
              >
                {/* Environment indicator */}
                {(window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1") && (
                  <div className="text-blue-700 bg-blue-50 p-3 rounded-md border border-blue-200 text-sm">
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 text-blue-400 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Development Mode: Using local API
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-red-700 bg-red-50 p-4 rounded-md border border-red-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error sending message
                        </h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="text-green-700 bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Message sent successfully!
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          Thank you for reaching out. I'll get back to you as
                          soon as possible!
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="What's your good name?"
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.name
                        ? "border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    disabled={loading}
                    required
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="What's your email address?"
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.email
                        ? "border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    disabled={loading}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can I help you? Please describe your project or inquiry..."
                    rows="6"
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 transition-colors resize-vertical ${
                      fieldErrors.message
                        ? "border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    disabled={loading}
                    required
                  />
                  {fieldErrors.message && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={`group transition-all duration-200 ${
                    loading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:scale-105"
                  }`}
                  disabled={loading}
                >
                  <div className="cta-button">
                    <div className="bg-circle" />
                    <p className="text flex items-center justify-center">
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          SENDING...
                        </>
                      ) : (
                        "SEND MESSAGE"
                      )}
                    </p>
                    <div className="arrow-wrapper">
                      <img src="/images/arrow-down.svg" alt="arrow" />
                    </div>
                  </div>
                </button>

                <p className="text-sm text-gray-500 text-center">
                  <span className="text-red-500">*</span> Required fields
                </p>
              </form>
            </div>
          </div>
          <div className="xl:col-span-7 min-h-96">
            <div className="bg-[#cd7c2e] w-full h-full hover:cursor-grab rounded-3xl overflow-hidden">
              <ContactExperience />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
