'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export default function EmbedCodePage() {
  const { id } = useParams();
  const router = useRouter();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!tenantId || !id) return;
    apiClient
      .get(`/chatbots/${id}/embed-code`, { headers: { 'x-tenant-id': tenantId } })
      .then((res) => setEmbedCode(res.data.embedCode));
  }, [tenantId, id]);

  function copyToClipboard() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.push(`/chatbots/${id}`)} className="text-sm text-primary-600 hover:underline mb-1">
          &larr; Back to chatbot
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Embed Code</h1>
        <p className="text-gray-500 text-sm mt-1">Add your chatbot to any website with a single code snippet.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Code snippet */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-3">Script Tag</h3>
          <p className="text-sm text-gray-500 mb-4">
            Paste this code snippet just before the closing <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code> tag on your website.
          </p>
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-5 rounded-xl text-sm overflow-x-auto leading-relaxed">
              {embedCode || 'Loading...'}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Platform instructions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-4">Installation Guides</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm">WordPress</h4>
              <p className="text-sm text-gray-500 mt-1">
                Go to <strong>Appearance &rarr; Theme Editor &rarr; footer.php</strong> and paste the code before <code className="bg-gray-200 px-1 rounded text-xs">&lt;/body&gt;</code>.
                Or use our WordPress plugin for easier setup.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm">Shopify</h4>
              <p className="text-sm text-gray-500 mt-1">
                Go to <strong>Online Store &rarr; Themes &rarr; Edit Code &rarr; theme.liquid</strong> and paste before <code className="bg-gray-200 px-1 rounded text-xs">&lt;/body&gt;</code>.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm">Wix</h4>
              <p className="text-sm text-gray-500 mt-1">
                Go to <strong>Settings &rarr; Custom Code &rarr; Add Custom Code</strong>. Paste the snippet and set placement to &quot;Body - end&quot;.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm">Custom HTML</h4>
              <p className="text-sm text-gray-500 mt-1">
                Paste the code directly into your HTML file before the closing <code className="bg-gray-200 px-1 rounded text-xs">&lt;/body&gt;</code> tag.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
