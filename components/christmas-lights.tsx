"use client"

export function ChristmasLights() {
  const lights = [
    { color: "bg-red-500", delay: "0s" },
    { color: "bg-green-500", delay: "0.2s" },
    { color: "bg-yellow-400", delay: "0.4s" },
    { color: "bg-blue-500", delay: "0.6s" },
    { color: "bg-red-500", delay: "0.8s" },
    { color: "bg-green-500", delay: "1s" },
    { color: "bg-yellow-400", delay: "1.2s" },
    { color: "bg-blue-500", delay: "1.4s" },
  ]

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-around py-2 z-40 pointer-events-none">
      {lights.map((light, index) => (
        <div key={index} className="relative">
          {/* Wire */}
          <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-slate-700" />
          {/* Bulb */}
          <div
            className={`mt-3 w-3 h-4 ${light.color} rounded-b-full animate-christmas-light shadow-lg`}
            style={{
              animationDelay: light.delay,
            }}
          />
          {/* Glow effect */}
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 w-6 h-6 ${light.color} rounded-full blur-md opacity-50 animate-christmas-light`}
            style={{
              animationDelay: light.delay,
            }}
          />
        </div>
      ))}
    </div>
  )
}
