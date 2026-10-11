/**
 * @file Route registry for Procure to Pay.
 * Supplier data is still shared with Asset workflows through the existing
 * repository until the INV_SUPPLIER API is available.
 */
import VendorSupplierMasterCreate from '../asset/vendor-supplier-master/pages/VendorSupplierMasterCreate'
import VendorSupplierMasterEdit from '../asset/vendor-supplier-master/pages/VendorSupplierMasterEdit'
import VendorSupplierMasterList from '../asset/vendor-supplier-master/pages/VendorSupplierMasterList'
import AssetUnitOfMeasureCreate from './asset-unit-of-measure/pages/AssetUnitOfMeasureCreate'
import AssetUnitOfMeasureEdit from './asset-unit-of-measure/pages/AssetUnitOfMeasureEdit'
import AssetUnitOfMeasureList from './asset-unit-of-measure/pages/AssetUnitOfMeasureList'

export const procureToPayRoutes = [
  {
    path: 'procure-to-pay/procurement-settings/supplier-information',
    element: <VendorSupplierMasterList />,
  },
  {
    path: 'procure-to-pay/procurement-settings/supplier-information/create',
    element: <VendorSupplierMasterCreate />,
  },
  {
    path: 'procure-to-pay/procurement-settings/supplier-information/:vendorSupplierId/edit',
    element: <VendorSupplierMasterEdit />,
  },
  {
    path: 'procure-to-pay/procurement-settings/asset-unit-of-measure',
    element: <AssetUnitOfMeasureList />,
  },
  {
    path: 'procure-to-pay/procurement-settings/asset-unit-of-measure/create',
    element: <AssetUnitOfMeasureCreate />,
  },
  {
    path: 'procure-to-pay/procurement-settings/asset-unit-of-measure/:assetUnitOfMeasureId/edit',
    element: <AssetUnitOfMeasureEdit />,
  },
]
