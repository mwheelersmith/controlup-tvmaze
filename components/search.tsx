import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import fetchResults from "@/utils/fetchTvSearchResults";

export default function Search() {
  const [searchResults, setSearchResults] = useState<
    { show: { id: number; name: string; genres: string[] } }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastResultRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchInput = (term: string) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (term === "") {
      setPage(1);
      setSearchResults([]);
      return;
    }

    // Debounce user input (could be extracted into a custom hook)
    typingTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchTerm(term);
        setPage(1);
        setSearchResults([]);

        const response = await fetchResults(term, 1);

        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching:", error);
      }
    }, 1000);
  };

  // Load more results when the last result becomes visible
  const loadMoreResults = async () => {
    if (loading || !searchTerm) return;

    try {
      setLoading(true);

      const response = await fetchResults(searchTerm, page + 1);

      if (!response.ok) throw new Error("Failed to load more results");

      const data = await response.json();

      setSearchResults((prevResults) => [...prevResults, ...data]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setLoading(false);
    }
  };

  // Set up intersection observer
  useEffect(() => {
    if (!lastResultRef.current) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && searchTerm) {
        loadMoreResults();
      }
    });

    observer.current.observe(lastResultRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [searchResults, loading, searchTerm]);

  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        name="search"
        className="border border-slate-300 rounded-full px-4 py-2 w-full"
        onChange={(e) => handleSearchInput(e.target.value)}
        placeholder="Search TV shows..."
        aria-label="Search TV shows"
      />

      {searchResults.length > 0 && (
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto h-96 bg-zinc-100 rounded-lg shadow-xl shadow-zinc-200"
        >
          {searchResults.map((result, index) => {
            const isLastItem = index === searchResults.length - 1;

            return (
              <div
                key={`${result.show.id}-${index}`}
                className="flex items-center p-4"
                ref={isLastItem ? lastResultRef : null}
              >
                <span className="pr-2">{result.show.name}</span>
                {result.show.genres?.length > 0 && (
                  <span className="text-gray-600">
                    ({result.show.genres.join(", ")})
                  </span>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col items-center p-4">
              <Image src="/loading.svg" alt="Loading" width={20} height={20} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
