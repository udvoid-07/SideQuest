export default function ProfileLoading() {
  return (
    <div className="p-8 max-w-3xl space-y-6 animate-pulse">
      <div className="skeleton h-9 w-32 rounded-xl" />
      <div className="skeleton h-44 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="skeleton h-48 rounded-2xl" />
      <div className="skeleton h-32 rounded-2xl" />
    </div>
  )
}
