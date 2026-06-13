export default function AppLoading() {
  return (
    <div className="p-8 max-w-4xl animate-pulse space-y-6">
      <div className="skeleton h-10 w-72 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="skeleton h-52 rounded-2xl" />
      <div className="grid md:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-44 rounded-2xl" />)}
      </div>
    </div>
  )
}
