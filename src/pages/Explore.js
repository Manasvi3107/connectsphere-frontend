import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api';

const Explore = ({ darkMode }) => {
  const [media, setMedia] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchMedia = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await API.get(`/media/explore?page=${pageNumber}&per_page=15`);
      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        setMedia((prev) => [...prev, ...res.data]);
      }
    } catch (err) {
      console.error('Failed to fetch explore media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(page);
  }, [page]);

  const lastMediaRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div
      className={`p-4 min-h-screen transition-all duration-300 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-pink-50 text-gray-900'
      }`}
    >
      <h2 className="text-3xl font-bold mb-4">🌍 Explore Feed</h2>
      {media.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {media.map((item, index) => {
            if (media.length === index + 1) {
              return (
                <div
                  key={item.id}
                  ref={lastMediaRef}
                  className={`rounded-lg overflow-hidden shadow-md group cursor-pointer transition-transform transform hover:scale-105 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.alt || 'Pexels'}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-2 text-sm text-gray-700 dark:text-gray-300">
                    📸 {item.photographer}
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={item.id}
                  className={`rounded-lg overflow-hidden shadow-md group cursor-pointer transition-transform transform hover:scale-105 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.alt || 'Pexels'}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-2 text-sm text-gray-700 dark:text-gray-300">
                    📸 {item.photographer}
                  </div>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <p>No media found.</p>
      )}

      {loading && <p className="mt-4 text-center">Loading more media...</p>}
      {!hasMore && (
        <p className="mt-4 text-center text-gray-500">
          🎉 You have seen all available media!
        </p>
      )}
    </div>
  );
};

export default Explore;
