'use client';

import { useState, useEffect } from 'react';

interface Quote {
  id: number;
  content: string;
  author: string | null;
  category: string | null;
}

export function RandomQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotes/random');
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
      } else {
        console.error('Failed to fetch quote');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="p-6 my-6 bg-white/5 rounded-xl border border-white/10 text-center">
      <h2 className="text-xl font-bold mb-4 text-white">随机一言 (Random Quote)</h2>
      
      {loading ? (
        <p className="text-white/60 animate-pulse">Loading...</p>
      ) : quote ? (
        <div className="space-y-2">
          <p className="text-lg font-medium text-white">&quot;{quote.content}&quot;</p>
          {quote.author && (
            <p className="text-sm text-white/60">- {quote.author}</p>
          )}
        </div>
      ) : (
        <p className="text-white/60">No quote found</p>
      )}

      <button
        onClick={fetchQuote}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-colors"
      >
        Next Quote
      </button>
    </div>
  );
}
