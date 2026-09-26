export default function Loading() {
  return (
    <div className="container-page py-10 sm:py-14" aria-busy="true">
      <div className="skeleton h-12 w-48" />
      <div className="skeleton mt-6 h-14 max-w-2xl" />
      <div className="mt-10 grid gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton aspect-[4/3] w-32 shrink-0 sm:w-44" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
