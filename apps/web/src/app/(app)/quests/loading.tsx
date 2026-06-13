export default function QuestsLoading() {
  return (
    <div className="p-8 max-w-5xl space-y-6 animate-pulse">
      <div className="skeleton h-9 w-48 rounded-xl" />
      <div className="skeleton h-11 w-full rounded-xl" />
      <div className="flex gap-2 flex-wrap">
        {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="skeleton h-8 w-20 rounded-xl" />)}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="skeleton h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
