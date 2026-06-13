export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-4xl space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="skeleton h-9 w-64 rounded-xl" />
        <div className="skeleton h-5 w-48 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div>
        <div className="skeleton h-5 w-32 rounded-lg mb-4" />
        <div className="skeleton h-56 rounded-2xl" />
      </div>
      <div>
        <div className="skeleton h-5 w-28 rounded-lg mb-4" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      </div>
    </div>
  )
}
