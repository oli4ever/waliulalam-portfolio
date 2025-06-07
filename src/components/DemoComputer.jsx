import React, { useState, useEffect } from "react";

const CSS3DComputer = ({ texture, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (texture) {
      const img = new Image();
      img.onload = () => setLoaded(true);
      img.onerror = () => {
        setImageError(true);
        setLoaded(true);
      };
      img.src = texture;
    } else {
      setLoaded(true);
    }
  }, [texture]);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className}`}
    >
      <div
        className="relative transform-gpu scale-50 sm:scale-50 lg:scale-100"
        style={{
          perspective: "1000px",
          transform: "rotateX(0deg) rotateY(-10deg) scale(1)",
          transformOrigin: "center center",
        }}
      >
        {/* Monitor Base */}
        <div
          className="absolute bg-gray-800 rounded-lg shadow-2xl"
          style={{
            width: "min(400px, 80vw)",
            height: "20px",
            bottom: "-100px",
            left: "50%",
            transform: "translateX(-60%) rotateX(90deg)",
            transformOrigin: "center bottom",
          }}
        />

        {/* Monitor Stand */}
        <div
          className="absolute bg-gray-700"
          style={{
            width: "20px",
            height: "80px",
            bottom: "-50px",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "10px",
          }}
        />

        {/* Monitor Frame */}
        <div
          className="relative bg-gray-300 rounded-lg shadow-2xl -mt-10 p-2"
          style={{
            width: "min(600px, 80vw)",
            height: "min(300px, 50vw)",
            maxHeight: "300px",
            transform: "rotateX(0deg)",
          }}
        >
          {/* Screen */}
          <div
            className="w-full h-full bg-black rounded overflow-hidden relative"
            style={{
              background:
                loaded && !imageError && texture
                  ? `url(${texture}) center/cover no-repeat`
                  : "linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)",
            }}
          >
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {loaded && imageError && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl mb-2">📱</div>
                  <div>Preview</div>
                </div>
              </div>
            )}

            {loaded && !imageError && texture && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            )}
          </div>

          {/* Screen Reflection */}
          <div
            className="absolute inset-0 rounded"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Keyboard */}
        <div
          className="absolute bg-gray-800 rounded shadow-lg max-sm:mb-3"
          style={{
            width: "min(300px, 70vw)",
            height: "min(100px, 15vw)",
            maxHeight: "100px",
            bottom: "-120px",
            left: "50%",
            transform: "translateX(-50%) rotateX(75deg)",
            transformOrigin: "center top",
          }}
        >
          {/* Keyboard Keys */}
          <div className="grid grid-cols-12 gap-1 p-2 h-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-600 rounded-sm"
                style={{ height: "6px" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 sm:border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white font-semibold text-sm sm:text-base">
          Loading 3D Preview...
        </p>
      </div>
    </div>
  );
};

const DemoComputer = ({ texture, className = "" }) => {
  return (
    <div className={`w-full h-full overflow-hidden ${className}`}>
      <CSS3DComputer texture={texture} />
    </div>
  );
};

export default DemoComputer;
