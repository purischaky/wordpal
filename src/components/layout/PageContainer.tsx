interface PageContainerProps {
  children: React.ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}
