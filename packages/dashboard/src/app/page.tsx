import Link from 'next/link';

const features = [
  {
    title: 'AI-Powered Conversations',
    desc: 'Train your chatbot on your own data. It answers customer questions instantly using your knowledge base.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
  },
  {
    title: 'Lead Capture',
    desc: 'Automatically collect visitor information and convert conversations into qualified leads.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    title: 'Appointment Booking',
    desc: 'Let customers book appointments directly through the chatbot with real-time availability.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" />
      </svg>
    ),
  },
  {
    title: 'Live Agent Handoff',
    desc: 'Seamlessly transfer complex conversations to your team with full chat history preserved.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: 'Analytics Dashboard',
    desc: 'Track conversations, measure engagement, and understand what your customers are asking.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: 'Easy Integration',
    desc: 'Add to any website with a single script tag. Works with WordPress, Shopify, and custom sites.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
];

const steps = [
  { num: '1', title: 'Create Your Chatbot', desc: 'Sign up and create your first AI chatbot in under a minute.' },
  { num: '2', title: 'Train It', desc: 'Upload documents, URLs, or FAQs to build your knowledge base.' },
  { num: '3', title: 'Embed on Your Site', desc: 'Copy a single line of code and paste it into your website.' },
  { num: '4', title: 'Start Engaging', desc: 'Your chatbot instantly answers customer questions 24/7.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Sayak AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-5 py-2.5 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-block bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          AI-Powered Customer Support
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          Your AI Chatbot That{' '}
          <span className="text-primary-600">Actually Knows</span>{' '}
          Your Business
        </h1>
        <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed">
          Train a custom AI chatbot on your content. It answers customer questions, captures leads,
          and books appointments — all while you sleep.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/register"
            className="bg-primary-600 text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
          >
            Start Free Trial
          </Link>
          <Link
            href="#how-it-works"
            className="text-gray-600 px-8 py-3.5 rounded-lg text-base font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            See How It Works
          </Link>
        </div>

        {/* Hero visual */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex gap-6">
              {/* Chat preview */}
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">S</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sayak AI Assistant</p>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-primary-50 text-primary-900 px-4 py-2.5 rounded-xl rounded-tl-sm text-sm max-w-[80%]">
                    Hi! How can I help you today?
                  </div>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-xl rounded-tr-sm text-sm max-w-[80%] ml-auto">
                    What are your pricing plans?
                  </div>
                  <div className="bg-primary-50 text-primary-900 px-4 py-2.5 rounded-xl rounded-tl-sm text-sm max-w-[85%]">
                    We offer 3 plans: Starter (free), Pro ($29/mo), and Enterprise. The Pro plan includes unlimited chatbots and priority support. Would you like more details?
                  </div>
                </div>
              </div>
              {/* Stats sidebar */}
              <div className="w-48 space-y-3 hidden md:block">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">2.4k</p>
                  <p className="text-xs text-gray-500">Conversations today</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-2xl font-bold text-green-600">94%</p>
                  <p className="text-xs text-gray-500">Resolution rate</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-2xl font-bold text-primary-600">127</p>
                  <p className="text-xs text-gray-500">Leads captured</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need to Automate Support
            </h2>
            <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
              From answering FAQs to booking appointments, your AI chatbot handles it all.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Up and Running in Minutes
            </h2>
            <p className="text-lg text-gray-500 mt-4">
              No coding required. Get your AI chatbot live in 4 simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12">
            <div className="md:flex items-center gap-12">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  One Line of Code. Any Website.
                </h2>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Add your AI chatbot to any website with a single script tag.
                  Works with WordPress, Shopify, Wix, Squarespace, and any custom site.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['WordPress', 'Shopify', 'Wix', 'Squarespace', 'Custom HTML'].map((p) => (
                    <span key={p} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1 mt-8 md:mt-0">
                <div className="bg-gray-900 rounded-xl p-5 font-mono text-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <pre className="text-green-400 overflow-x-auto">
{`<script>
  (function(w,d,c){
    w.AIChatbot = {id: c};
    var s = d.createElement('script');
    s.src = 'https://your-widget.vercel.app/widget.js';
    s.async = true;
    d.head.appendChild(s);
  })(window, document, 'YOUR_BOT_ID');
</script>`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Customer Support?
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Join businesses using Sayak AI to automate support, capture leads, and delight customers 24/7.
          </p>
          <Link
            href="/register"
            className="inline-block bg-primary-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
          >
            Get Started Free
          </Link>
          <p className="text-sm text-gray-400 mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="md:flex items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Sayak AI Chatbot</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/login" className="hover:text-gray-700">Dashboard</Link>
              <Link href="/register" className="hover:text-gray-700">Sign Up</Link>
              <a href="mailto:support@sayakai.com" className="hover:text-gray-700">Contact</a>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-8 text-center">
            &copy; {new Date().getFullYear()} Sayak AI Chatbot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
