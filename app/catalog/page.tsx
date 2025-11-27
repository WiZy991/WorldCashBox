import ProductsCatalog from '@/components/ProductsCatalog'

export default function CatalogPage() {
  return (
    <div className="min-h-screen pt-20">
      <ProductsCatalog showAll={true} />
    </div>
  )
}

