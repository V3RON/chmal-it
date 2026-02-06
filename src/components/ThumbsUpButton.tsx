import { useState, useEffect, useCallback, useRef } from 'react';
import { ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThumbsUpButtonProps {
  slug: string;
}

export default function ThumbsUpButton({ slug }: ThumbsUpButtonProps) {
  const [count, setCount] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const triggerConfetti = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };

    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue('--primary').trim();
    const accent = styles.getPropertyValue('--accent').trim();
    const foreground = styles.getPropertyValue('--foreground').trim();
    const colors = [
      primary ? `hsl(${primary})` : '#111827',
      accent ? `hsl(${accent})` : '#9CA3AF',
      foreground ? `hsl(${foreground})` : '#F59E0B',
    ];

    confetti({
      particleCount: 50,
      spread: 70,
      startVelocity: 30,
      gravity: 0.8,
      ticks: 200,
      origin,
      colors,
    });
  }, []);

  // Check localStorage and fetch initial count on mount
  useEffect(() => {
    const checkVoteStatus = async () => {
      // Check localStorage first
      const localVoted = localStorage.getItem(`liked_${slug}`) === 'true';

      try {
        // Fetch current count and server-side vote status
        const response = await fetch(`/api/likes/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setCount(data.count);
          // User has voted if either client or server says so
          setHasVoted(localVoted || data.hasVoted);
        }
      } catch (error) {
        console.error('Error fetching likes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkVoteStatus();
  }, [slug]);

  const handleClick = async () => {
    if (hasVoted || isLoading) return;

    // Optimistic update
    const previousCount = count;
    setCount(count + 1);
    setHasVoted(true);
    localStorage.setItem(`liked_${slug}`, 'true');
    triggerConfetti();

    try {
      const response = await fetch(`/api/likes/${slug}`, {
        method: 'POST',
      });

      if (!response.ok) {
        // Revert on error
        setCount(previousCount);
        setHasVoted(false);
        localStorage.removeItem(`liked_${slug}`);
        console.error('Failed to submit vote');
      } else {
        const data = await response.json();
        // Update with actual count from server
        if (data.count !== undefined) {
          setCount(data.count);
        }
      }
    } catch (error) {
      // Revert on network error
      setCount(previousCount);
      setHasVoted(false);
      localStorage.removeItem(`liked_${slug}`);
      console.error('Error submitting vote:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
      <span className="text-sm text-muted-foreground">
        Did you like this article? Leave a thumbs up.
      </span>
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={hasVoted || isLoading}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-lg
          transition-all duration-200
          ${hasVoted
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-default'
            : 'bg-muted hover:bg-muted/80 text-foreground cursor-pointer hover:scale-105'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label={hasVoted ? 'You liked this article' : 'Like this article'}
      >
        <ThumbsUp
          size={20}
          className={hasVoted ? 'fill-current' : ''}
        />
        <span className="font-medium text-sm">
          {count} {count === 1 ? 'like' : 'likes'}
        </span>
      </button>
    </div>
  );
}
